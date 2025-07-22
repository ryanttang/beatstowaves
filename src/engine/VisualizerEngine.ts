import * as THREE from 'three';
import seedrandom from 'seedrandom';
import type { VisualMode } from '../store';

export class VisualizerEngine {
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private rng: seedrandom.PRNG;
  private animationId: number | null = null;
  private mountEl: HTMLDivElement;
  private visualMode: VisualMode;
  private intensity: number;
  private bars: THREE.Mesh[] = [];
  private waves: THREE.Line[] = [];
  private particles: THREE.Points | null = null;
  private audioData: Uint8Array | null = null;
  private effects = {
    noise: 0.5,
    wobble: 0.5,
    distort: 0.5,
    digital: 0.5,
    space: 0.5,
    magnetic: 0.5,
  };
  private visualOptions = {
    color: '#4a90e2',
    colorGradient: ['#4a90e2', '#e07a3f'],
    colorPalette: 'default',
    colorAnimated: false,
    size: 1,
    sizeX: 1,
    sizeY: 1,
    sizeZ: 1,
    sizeAudioReactive: false,
    shape: 'box',
    shapeMorph: 0,
    count: 16,
    countAuto: false,
    lights: [
      { color: '#ffffff', intensity: 1, position: [0, 20, 20] }
    ],
    shadows: false,
    background: '#23253a',
    backgroundImage: undefined as string | undefined,
    backgroundAnimation: 'none',
    audioReactiveMorph: false,
    audioReactiveColor: false,
    audioReactiveSize: false,
    audioBand: 'bass' as 'bass' | 'mid' | 'treble',
  };

  /**
   * Set effect values (from knobs)
   */
  public setEffects(effects: { noise: number; wobble: number; distort: number; digital: number; space: number; magnetic: number }) {
    this.effects = { ...effects };
  }

  /**
   * Set visual options (from editing controls)
   */
  public setVisualOptions(options: Partial<typeof this.visualOptions>) {
    this.visualOptions = { ...this.visualOptions, ...options };
    this.generateScene(); // Regenerate scene for options that affect geometry/material
  }

  constructor(mountEl: HTMLDivElement, seed: string, visualMode: VisualMode, intensity: number) {
    this.mountEl = mountEl;
    this.visualMode = visualMode;
    this.intensity = intensity;
    this.rng = seedrandom(seed);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, mountEl.clientWidth / mountEl.clientHeight, 0.1, 1000);
    this.camera.position.z = 30;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    // Add debug border and background
    this.renderer.domElement.style.border = '2px solid #38bdf8';
    this.renderer.domElement.style.background = '#222';
    mountEl.appendChild(this.renderer.domElement);
    console.log('[VisualizerEngine] Constructed', { seed, visualMode, intensity });
    this.generateScene();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  generateScene() {
    console.log('[VisualizerEngine] Generating scene for mode:', this.visualMode);
    // Clear previous
    this.bars = [];
    this.waves = [];
    this.particles = null;
    this.scene.clear();
    // Visual options
    const {
      color, colorGradient, colorPalette, colorAnimated,
      size, sizeX, sizeY, sizeZ, sizeAudioReactive,
      shape, shapeMorph,
      count, countAuto,
      lights, shadows,
      background, backgroundImage, backgroundAnimation,
      audioReactiveMorph, audioReactiveColor, audioReactiveSize, audioBand
    } = this.visualOptions;
    // Lighting
    if (Array.isArray(lights)) {
      lights.forEach(lightOpt => {
        const light = new THREE.PointLight(lightOpt.color, lightOpt.intensity, 100);
        const pos = Array.isArray(lightOpt.position) && lightOpt.position.length === 3 ? lightOpt.position : [0, 20, 20];
        light.position.set(pos[0], pos[1], pos[2]);
        if (shadows) {
          light.castShadow = true;
        }
        this.scene.add(light);
      });
    }
    // Add ambient light for better visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    // Set renderer background
    if (backgroundImage) {
      this.renderer.domElement.style.background = `url('${backgroundImage}') center/cover`;
    } else if (backgroundAnimation === 'gradient') {
      this.renderer.domElement.style.background = `linear-gradient(135deg, ${colorGradient[0]}, ${colorGradient[1]})`;
    } else {
      this.renderer.domElement.style.background = background;
    }
    // Mode-specific
    let barCount = countAuto ? 32 : count;
    if (this.visualMode === 'classic' || this.visualMode === 'bars') {
      for (let i = 0; i < barCount; i++) {
        // Color logic
        let barColor;
        if (this.visualMode === 'classic' || colorPalette === 'rainbow') {
          barColor = new THREE.Color().setHSL(i / barCount, 1, 0.5);
        } else if (colorPalette === 'warm') {
          barColor = new THREE.Color().lerpColors(new THREE.Color('#e07a3f'), new THREE.Color('#e6c15c'), i / barCount);
        } else if (colorPalette === 'cool') {
          barColor = new THREE.Color().lerpColors(new THREE.Color('#4a90e2'), new THREE.Color('#3bb6b0'), i / barCount);
        } else if (colorGradient && colorGradient.length === 2) {
          barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), i / barCount);
        } else {
          barColor = new THREE.Color(color);
        }
        // Animated color
        if (colorAnimated) {
          const t = (Date.now() * 0.0005 + i / barCount) % 1;
          barColor.offsetHSL(t, 0, 0);
        }
        // Morphing shape
        let geometry;
        if (shape === 'cylinder' || (shape === 'morph' && shapeMorph > 0.5)) {
          geometry = new THREE.CylinderGeometry(0.75 * size * sizeX, 0.75 * size * sizeX, 5 * size * sizeY, 16);
        } else if (shape === 'sphere') {
          geometry = new THREE.SphereGeometry(0.9 * size * sizeX, 16, 16);
        } else if (shape === 'torus') {
          geometry = new THREE.TorusGeometry(1.2 * size * sizeX, 0.4 * size * sizeY, 16, 100);
        } else if (shape === 'cone') {
          geometry = new THREE.ConeGeometry(1 * size * sizeX, 5 * size * sizeY, 16);
        } else if (shape === 'morph') {
          // Morph between box and sphere
          const morph = shapeMorph;
          if (morph < 0.5) {
            geometry = new THREE.BoxGeometry(1.5 * size * sizeX, 5 * size * sizeY, 1.5 * size * sizeZ);
          } else {
            geometry = new THREE.SphereGeometry(0.9 * size * sizeX, 16, 16);
          }
        } else {
          geometry = new THREE.BoxGeometry(1.5 * size * sizeX, 5 * size * sizeY, 1.5 * size * sizeZ);
        }
        const material = new THREE.MeshStandardMaterial({ color: barColor });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (i - barCount / 2) * (this.visualMode === 'classic' ? 2.0 : 0.5) * size;
        mesh.scale.y = 5;
        this.scene.add(mesh);
        this.bars.push(mesh);
      }
    } else if (this.visualMode === 'waves') {
      const waveColor = new THREE.Color(color);
      const waveCount = Math.max(1, Math.floor(barCount / 8));
      for (let w = 0; w < waveCount; w++) {
        const points = [];
        for (let i = 0; i < 128; i++) {
          points.push(new THREE.Vector3(i - 64, 0, w * 2 * sizeZ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: waveColor, linewidth: size });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.waves.push(line);
      }
    } else if (this.visualMode === 'particles') {
      const particleColor = new THREE.Color(color);
      const particleCount = barCount * 8;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (this.rng() - 0.5) * 40 * sizeX;
        positions[i * 3 + 1] = (this.rng() - 0.5) * 20 * sizeY;
        positions[i * 3 + 2] = (this.rng() - 0.5) * 40 * sizeZ;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: particleColor, size: 0.5 * size });
      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    }
  }

  updateAudioData(data: Uint8Array) {
    this.audioData = data;
  }

  animate() {
    // Debug log for animation
    // Only log every 60th frame to avoid spam
    const win = window as any;
    if (!win.__frameCount) win.__frameCount = 0;
    win.__frameCount++;
    if (win.__frameCount % 60 === 0) {
      console.log('[VisualizerEngine] animate frame', win.__frameCount);
    }
    const { noise, wobble, distort, digital, space, magnetic } = this.effects;
    const { sizeAudioReactive, audioReactiveMorph, audioReactiveColor, audioReactiveSize, audioBand } = this.visualOptions;
    // Helper to get audio band value
    const getBandValue = (data: Uint8Array, band: string) => {
      if (!data) return 0.5;
      const len = data.length;
      if (band === 'bass') return data.slice(0, Math.floor(len / 4)).reduce((a, b) => a + b, 0) / (len / 4) / 255;
      if (band === 'mid') return data.slice(Math.floor(len / 4), Math.floor(len * 2 / 3)).reduce((a, b) => a + b, 0) / (len * (2 / 3 - 1 / 4)) / 255;
      if (band === 'treble') return data.slice(Math.floor(len * 2 / 3)).reduce((a, b) => a + b, 0) / (len / 3) / 255;
      return 0.5;
    };
    // Animate based on mode
    if (this.visualMode === 'classic' || this.visualMode === 'bars') {
      if (this.bars.length) {
        let data = this.audioData;
        // If no audio, use a sine wave for animation
        if (!data) {
          data = new Uint8Array(this.bars.length);
          const t = Date.now() * 0.002;
          for (let i = 0; i < data.length; i++) {
            data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
          }
        }
        const t = Date.now() * 0.002;
        // Get global morph/color/size value from selected band
        const bandValue = getBandValue(data, audioBand);
        for (let i = 0; i < this.bars.length; i++) {
          // --- EFFECTS ---
          // Morphing: interpolate shapeMorph by audio if enabled
          let morph = this.visualOptions.shapeMorph;
          if (audioReactiveMorph) {
            morph = bandValue;
          }
          // Color: animate by audio if enabled
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL(bandValue * 0.5, 0, 0);
            }
          }
          // Base scale from audio
          let scale = (data[i % data.length] / 255) * this.intensity * 10 + 1;
          // Audio-reactive size
          if (sizeAudioReactive || audioReactiveSize) {
            scale *= 1 + (data[i % data.length] / 255) * (audioReactiveSize ? bandValue : 1);
          }
          // Distort: nonlinear scaling
          scale = scale ** (1 + distort);
          // Wobble: add sinusoidal modulation
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          // Noise: add random jitter
          scale += (Math.random() - 0.5) * noise * 2;
          // Digital: quantize scale
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          // Magnetic: pull toward center
          const centerPull = 1 - Math.abs((i - this.bars.length / 2) / (this.bars.length / 2));
          scale += magnetic * centerPull * 2;
          // Space: affect bar spread (x position)
          const baseX = (i - this.bars.length / 2) * (this.visualMode === 'classic' ? 2.0 : 0.5);
          this.bars[i].position.x = baseX * (1 + space * 0.5);
          this.bars[i].scale.y = Math.max(0.1, scale);
          // Morph geometry (box <-> sphere <-> cylinder <-> torus <-> cone)
          if (this.visualOptions.shape === 'morph') {
            // For demo: morph 0-0.25=box, 0.25-0.5=sphere, 0.5-0.75=cylinder, 0.75-1=torus
            let newGeometry;
            if (morph < 0.25) {
              newGeometry = new THREE.BoxGeometry(1.5, 5, 1.5);
            } else if (morph < 0.5) {
              newGeometry = new THREE.SphereGeometry(2, 16, 16);
            } else if (morph < 0.75) {
              newGeometry = new THREE.CylinderGeometry(1, 1, 5, 16);
            } else {
              newGeometry = new THREE.TorusGeometry(2, 0.7, 16, 100);
            }
            this.bars[i].geometry.dispose();
            this.bars[i].geometry = newGeometry;
          }
        }
      }
    } else if (this.visualMode === 'waves') {
      if (this.audioData && this.waves.length) {
        const t = Date.now() * 0.002;
        for (let w = 0; w < this.waves.length; w++) {
          const positions = (this.waves[w].geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < positions.count; i++) {
            let y = (this.audioData[i % this.audioData.length] / 255 - 0.5) * this.intensity * 10;
            // Distort
            y = Math.sign(y) * Math.abs(y) ** (1 + distort);
            // Wobble
            y += Math.sin(t * (1 + wobble) + i * 0.1 + w) * wobble * 2;
            // Noise
            y += (Math.random() - 0.5) * noise * 2;
            // Digital
            if (digital > 0.05) {
              const steps = Math.round(2 + digital * 10);
              y = Math.round(y * steps) / steps;
            }
            // Magnetic
            const centerPull = 1 - Math.abs((i - positions.count / 2) / (positions.count / 2));
            y += magnetic * centerPull * 2;
            // Space: affect wave spread (z position)
            const baseZ = w * 2;
            positions.setZ(i, baseZ * (1 + space * 0.5));
            positions.setY(i, y);
          }
          positions.needsUpdate = true;
        }
      }
    } else if (this.visualMode === 'particles') {
      if (this.audioData && this.particles) {
        const t = Date.now() * 0.002;
        const positions = (this.particles.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          // Base positions
          let x = positions.getX(i);
          let y = positions.getY(i);
          let z = positions.getZ(i);
          // Audio-driven y
          y = (this.rng() - 0.5) * 20 + (this.audioData[i % this.audioData.length] / 255 - 0.5) * this.intensity * 10;
          // Distort
          y = Math.sign(y) * Math.abs(y) ** (1 + distort);
          // Wobble
          y += Math.sin(t * (1 + wobble) + i * 0.1) * wobble * 2;
          // Digital
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            y = Math.round(y * steps) / steps;
          }
          // Magnetic: pull toward center (y axis)
          const centerPull = 1 - Math.abs(x / 20);
          y += magnetic * centerPull * 2;
          // Space: affect spread (x/z)
          x *= 1 + space * 0.5;
          z *= 1 + space * 0.5;
          positions.setX(i, x);
          positions.setY(i, y);
          positions.setZ(i, z);
        }
        positions.needsUpdate = true;
      }
    }
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.mountEl.removeChild(this.renderer.domElement);
    this.scene.clear();
    this.bars = [];
    this.waves = [];
    this.particles = null;
  }
} 