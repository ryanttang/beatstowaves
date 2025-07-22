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
    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 20, 20);
    this.scene.add(light);
    // Add ambient light for better visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    // Mode-specific
    if (this.visualMode === 'classic') {
      // Classic: 16 thick, rainbow-colored bars
      const barCount = 16;
      for (let i = 0; i < barCount; i++) {
        // Rainbow color for each bar
        const color = new THREE.Color().setHSL(i / barCount, 1, 0.5);
        const geometry = new THREE.BoxGeometry(1.5, 5, 1.5);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (i - barCount / 2) * 2.0;
        mesh.scale.y = 5;
        this.scene.add(mesh);
        this.bars.push(mesh);
      }
    } else if (this.visualMode === 'bars') {
      // Bars: 64 thin, green bars
      const barCount = 64;
      const color = new THREE.Color(0x00ff00);
      for (let i = 0; i < barCount; i++) {
        const geometry = new THREE.BoxGeometry(0.3, 5, 0.3);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (i - barCount / 2) * 0.5;
        mesh.scale.y = 5;
        this.scene.add(mesh);
        this.bars.push(mesh);
      }
    } else if (this.visualMode === 'waves') {
      const color = new THREE.Color(this.rng(), this.rng(), this.rng());
      const waveCount = 3 + Math.floor(this.rng() * 3);
      for (let w = 0; w < waveCount; w++) {
        const points = [];
        for (let i = 0; i < 128; i++) {
          points.push(new THREE.Vector3(i - 64, 0, w * 2));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.waves.push(line);
      }
    } else if (this.visualMode === 'particles') {
      const color = new THREE.Color(this.rng(), this.rng(), this.rng());
      const particleCount = 256 + Math.floor(this.rng() * 256);
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (this.rng() - 0.5) * 40;
        positions[i * 3 + 1] = (this.rng() - 0.5) * 20;
        positions[i * 3 + 2] = (this.rng() - 0.5) * 40;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color, size: 0.5 });
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
        for (let i = 0; i < this.bars.length; i++) {
          const scale = (data[i % data.length] / 255) * this.intensity * 10 + 1;
          this.bars[i].scale.y = scale;
        }
      }
    } else if (this.visualMode === 'waves') {
      if (this.audioData && this.waves.length) {
        for (let w = 0; w < this.waves.length; w++) {
          const positions = (this.waves[w].geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < positions.count; i++) {
            const y = (this.audioData[i % this.audioData.length] / 255 - 0.5) * this.intensity * 10;
            positions.setY(i, y * Math.sin(i * 0.1 + w));
          }
          positions.needsUpdate = true;
        }
      }
    } else if (this.visualMode === 'particles') {
      if (this.audioData && this.particles) {
        const positions = (this.particles.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          const baseY = (this.rng() - 0.5) * 20;
          const y = baseY + (this.audioData[i % this.audioData.length] / 255 - 0.5) * this.intensity * 10;
          positions.setY(i, y);
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