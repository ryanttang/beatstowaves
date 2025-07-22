import * as THREE from 'three';
import seedrandom from 'seedrandom';
import type { VisualMode } from '../store';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

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
  private blobMesh: THREE.Mesh | null = null;
  private dnaObjects: { spheres: THREE.Mesh[], lines: THREE.Line[] } | null = null;
  private liquidDrops: THREE.Mesh[] | null = null;
  private orbitalsObjects: { nucleus: THREE.Mesh, electrons: THREE.Mesh[] } | null = null;
  private fractalTreeLines: THREE.Line[] | null = null;
  private polygonLine: THREE.Line | null = null;
  private waveGridMesh: THREE.Mesh | null = null;
  private textDeformMesh: THREE.Mesh | null = null;
  private auroraMesh: THREE.Mesh | null = null;

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
    this.dnaObjects = null; // Clear DNA objects
    this.liquidDrops = null; // Clear liquid drops
    this.orbitalsObjects = null; // Clear orbitals objects
    this.fractalTreeLines = null; // Clear fractal tree lines
    this.polygonLine = null; // Clear polygon line
    this.waveGridMesh = null; // Clear wave grid mesh
    this.textDeformMesh = null; // Clear text deform mesh on generate
    this.auroraMesh = null; // Clear aurora mesh on generate
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
    } else if (this.visualMode === 'spiral') {
      // Spiral mode: arrange bars in a 3D helix/spiral
      const spiralCount = countAuto ? 32 : count;
      const turns = 3; // Number of spiral turns
      const spiralHeight = 20 * sizeY;
      const spiralRadius = 8 * sizeX;
      for (let i = 0; i < spiralCount; i++) {
        // Audio-reactive color/size
        let barColor = new THREE.Color(color);
        if (colorGradient && colorGradient.length === 2) {
          barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), i / spiralCount);
        }
        if (colorAnimated) {
          const t = (Date.now() * 0.0005 + i / spiralCount) % 1;
          barColor.offsetHSL(t, 0, 0);
        }
        // Spiral math
        const t = i / spiralCount;
        const angle = turns * Math.PI * 2 * t;
        const x = Math.cos(angle) * spiralRadius;
        const y = -spiralHeight / 2 + spiralHeight * t;
        const z = Math.sin(angle) * spiralRadius;
        // Geometry
        const geometry = new THREE.BoxGeometry(1.2 * size * sizeX, 4 * size * sizeY, 1.2 * size * sizeZ);
        const material = new THREE.MeshStandardMaterial({ color: barColor });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.lookAt(0, y, 0); // Face toward spiral axis
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
    else if (this.visualMode === 'radial') {
      // Radial mode: arrange bars in a circle radiating from the center
      const radialCount = countAuto ? 32 : count;
      const radius = 10 * sizeX;
      for (let i = 0; i < radialCount; i++) {
        let barColor = new THREE.Color(color);
        if (colorGradient && colorGradient.length === 2) {
          barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), i / radialCount);
        }
        if (colorAnimated) {
          const t = (Date.now() * 0.0005 + i / radialCount) % 1;
          barColor.offsetHSL(t, 0, 0);
        }
        const angle = (i / radialCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        // Geometry: tall, thin bar radiating outward
        const geometry = new THREE.BoxGeometry(1.2 * size * sizeX, 6 * size * sizeY, 1.2 * size * sizeZ);
        const material = new THREE.MeshStandardMaterial({ color: barColor });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        mesh.lookAt(0, 0, 0); // Face toward center
        this.scene.add(mesh);
        this.bars.push(mesh);
      }
    }
    else if (this.visualMode === 'sphere') {
      // Sphere mode: arrange bars on a sphere
      const sphereCount = countAuto ? 64 : Math.max(8, count * 4);
      const radius = 10 * sizeX;
      for (let i = 0; i < sphereCount; i++) {
        // Spherical coordinates
        const phi = Math.acos(-1 + (2 * i) / sphereCount); // latitude
        const theta = Math.sqrt(sphereCount * Math.PI) * phi; // longitude
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        let barColor = new THREE.Color(color);
        if (colorGradient && colorGradient.length === 2) {
          barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), i / sphereCount);
        }
        if (colorAnimated) {
          const t = (Date.now() * 0.0005 + i / sphereCount) % 1;
          barColor.offsetHSL(t, 0, 0);
        }
        // Geometry: short bar or particle
        const geometry = new THREE.BoxGeometry(0.8 * size * sizeX, 2.5 * size * sizeY, 0.8 * size * sizeZ);
        const material = new THREE.MeshStandardMaterial({ color: barColor });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.lookAt(0, 0, 0); // Face toward center
        this.scene.add(mesh);
        this.bars.push(mesh);
      }
    }
    else if (this.visualMode === 'tunnel') {
      // Tunnel mode: arrange rings of bars/particles along the z-axis
      const tunnelSegments = countAuto ? 24 : Math.max(8, count * 2);
      const barsPerRing = 32;
      const tunnelRadius = 10 * sizeX;
      const tunnelLength = 60 * sizeY;
      for (let seg = 0; seg < tunnelSegments; seg++) {
        const z = -tunnelLength / 2 + (tunnelLength * seg) / tunnelSegments;
        for (let i = 0; i < barsPerRing; i++) {
          const angle = (i / barsPerRing) * Math.PI * 2;
          const x = Math.cos(angle) * tunnelRadius;
          const y = Math.sin(angle) * tunnelRadius;
          let barColor = new THREE.Color(color);
          if (colorGradient && colorGradient.length === 2) {
            barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), seg / tunnelSegments);
          }
          if (colorAnimated) {
            const t = (Date.now() * 0.0005 + seg / tunnelSegments) % 1;
            barColor.offsetHSL(t, 0, 0);
          }
          const geometry = new THREE.BoxGeometry(0.7 * size * sizeX, 2.2 * size * sizeY, 0.7 * size * sizeZ);
          const material = new THREE.MeshStandardMaterial({ color: barColor });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x, y, z);
          mesh.lookAt(0, 0, z + 10); // Face down the tunnel
          this.scene.add(mesh);
          this.bars.push(mesh);
        }
      }
    }
    else if (this.visualMode === 'grid') {
      // Grid mode: arrange cubes in a 2D or 3D grid
      const gridSize = Math.max(4, Math.floor(Math.cbrt(countAuto ? 64 : count * 8)));
      const spacing = 3 * sizeX;
      let idx = 0;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          for (let z = 0; z < gridSize; z++) {
            let barColor = new THREE.Color(color);
            if (colorGradient && colorGradient.length === 2) {
              barColor = new THREE.Color().lerpColors(new THREE.Color(colorGradient[0]), new THREE.Color(colorGradient[1]), idx / (gridSize ** 3));
            }
            if (colorAnimated) {
              const t = (Date.now() * 0.0005 + idx / (gridSize ** 3)) % 1;
              barColor.offsetHSL(t, 0, 0);
            }
            const geometry = new THREE.BoxGeometry(1.2 * size * sizeX, 1.2 * size * sizeY, 1.2 * size * sizeZ);
            const material = new THREE.MeshStandardMaterial({ color: barColor });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              (x - gridSize / 2) * spacing,
              (y - gridSize / 2) * spacing,
              (z - gridSize / 2) * spacing
            );
            this.scene.add(mesh);
            this.bars.push(mesh);
            idx++;
          }
        }
      }
    }
    else if (this.visualMode === 'ribbon') {
      // Ribbon mode: create a flowing mesh that represents the audio waveform
      const ribbonLength = 128;
      const points = [];
      for (let i = 0; i < ribbonLength; i++) {
        points.push(new THREE.Vector3(i - ribbonLength / 2, 0, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: color, linewidth: 4 });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.waves.push(line);
    }
    else if (this.visualMode === 'galaxy') {
      // Galaxy mode: swirling starfield of particles
      const starCount = countAuto ? 256 : Math.max(64, count * 16);
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 30 * sizeX;
        const spiral = Math.random() * 2 + 2;
        const x = Math.cos(angle) * radius * Math.pow(Math.random(), 0.5);
        const y = (Math.random() - 0.5) * 10 * sizeY;
        const z = Math.sin(angle) * radius * Math.pow(Math.random(), 0.5);
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        // Color: base color with some variation
        const baseColor = new THREE.Color(color);
        baseColor.offsetHSL((angle / (2 * Math.PI)) * 0.2, 0, (Math.random() - 0.5) * 0.2);
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size: 0.7 * size, vertexColors: true });
      const points = new THREE.Points(geometry, material);
      this.scene.add(points);
      this.particles = points;
    }
    else if (this.visualMode === 'blob') {
      // Blob mode: single organic mesh
      const geometry = new THREE.SphereGeometry(8 * this.visualOptions.size, 64, 64);
      const material = new THREE.MeshStandardMaterial({ color: this.visualOptions.color, roughness: 0.4, metalness: 0.2, flatShading: false });
      this.blobMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.blobMesh);
    }
    else if (this.visualMode === 'dna') {
      // DNA mode: two intertwining spirals with connecting lines
      const baseCount = 32;
      const helixRadius = 6 * this.visualOptions.size;
      const helixHeight = 18 * this.visualOptions.sizeY;
      const turns = 3;
      const spheres: THREE.Mesh[] = [];
      const lines: THREE.Line[] = [];
      for (let i = 0; i < baseCount; i++) {
        const t = i / baseCount;
        const angle = turns * Math.PI * 2 * t;
        // Spiral 1
        const x1 = Math.cos(angle) * helixRadius;
        const y1 = -helixHeight / 2 + helixHeight * t;
        const z1 = Math.sin(angle) * helixRadius;
        // Spiral 2 (offset by 180°)
        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const y2 = y1;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;
        // Spheres
        const sphereGeom = new THREE.SphereGeometry(0.6 * this.visualOptions.size, 16, 16);
        const color1 = new THREE.Color(this.visualOptions.color).offsetHSL(t * 0.2, 0, 0);
        const color2 = new THREE.Color(this.visualOptions.color).offsetHSL(0.5 + t * 0.2, 0, 0);
        const mat1 = new THREE.MeshStandardMaterial({ color: color1 });
        const mat2 = new THREE.MeshStandardMaterial({ color: color2 });
        const mesh1 = new THREE.Mesh(sphereGeom, mat1);
        const mesh2 = new THREE.Mesh(sphereGeom, mat2);
        mesh1.position.set(x1, y1, z1);
        mesh2.position.set(x2, y2, z2);
        this.scene.add(mesh1);
        this.scene.add(mesh2);
        spheres.push(mesh1, mesh2);
        // Connecting line
        const points = [
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3(x2, y2, z2)
        ];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const line = new THREE.Line(lineGeom, lineMat);
        this.scene.add(line);
        lines.push(line);
      }
      this.dnaObjects = { spheres, lines };
    }
    else if (this.visualMode === 'liquid') {
      // Liquid Drops mode: several spheres that pulse and merge visually
      const dropCount = 8;
      const drops: THREE.Mesh[] = [];
      for (let i = 0; i < dropCount; i++) {
        const geom = new THREE.SphereGeometry(2.5 * this.visualOptions.size, 32, 32);
        const color = new THREE.Color(this.visualOptions.color).offsetHSL(i / dropCount * 0.2, 0, 0);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5, transparent: true, opacity: 0.85 });
        const mesh = new THREE.Mesh(geom, mat);
        // Initial positions in a circle
        const angle = (i / dropCount) * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * 7, Math.sin(angle) * 7, 0);
        this.scene.add(mesh);
        drops.push(mesh);
      }
      this.liquidDrops = drops;
    }
    else if (this.visualMode === 'orbitals') {
      // Orbitals/Atomic mode: central nucleus and orbiting electrons
      const nucleusGeom = new THREE.SphereGeometry(2.5 * this.visualOptions.size, 32, 32);
      const nucleusMat = new THREE.MeshStandardMaterial({ color: this.visualOptions.color, roughness: 0.3, metalness: 0.7 });
      const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
      this.scene.add(nucleus);
      const electronCount = 8;
      const electrons: THREE.Mesh[] = [];
      for (let i = 0; i < electronCount; i++) {
        const electronGeom = new THREE.SphereGeometry(0.7 * this.visualOptions.size, 16, 16);
        const color = new THREE.Color(this.visualOptions.color).offsetHSL(0.3 + i / electronCount * 0.5, 0, 0.1);
        const electronMat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.8 });
        const electron = new THREE.Mesh(electronGeom, electronMat);
        this.scene.add(electron);
        electrons.push(electron);
      }
      this.orbitalsObjects = { nucleus, electrons };
    }
    else if (this.visualMode === 'fractal') {
      // Fractal Tree mode: recursively draw branches as lines
      const lines: THREE.Line[] = [];
      const maxDepth = 7;
      const branch = (start: THREE.Vector3, dir: THREE.Vector3, depth: number) => {
        if (depth > maxDepth) return;
        const len = 6 * Math.pow(0.7, depth) * this.visualOptions.size;
        const end = start.clone().add(dir.clone().multiplyScalar(len));
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const color = new THREE.Color(this.visualOptions.color).offsetHSL(depth * 0.08, 0, 0);
        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        lines.push(line);
        // Branching: two branches at angles
        const angle = Math.PI / 5 + depth * 0.07;
        const axis1 = new THREE.Vector3(0, 0, 1);
        const axis2 = new THREE.Vector3(0, 0, -1);
        const dir1 = dir.clone().applyAxisAngle(axis1, angle);
        const dir2 = dir.clone().applyAxisAngle(axis2, angle);
        branch(end, dir1, depth + 1);
        branch(end, dir2, depth + 1);
      };
      // Start from base
      branch(new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 1, 0), 0);
      this.fractalTreeLines = lines;
    }
    else if (this.visualMode === 'polygon') {
      // Polygon Morph mode: morph between polygons
      const sides = 3; // Start as triangle, will morph in animate
      const radius = 8 * this.visualOptions.size;
      const points = [];
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: this.visualOptions.color, linewidth: 3 });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.polygonLine = line;
    }
    else if (this.visualMode === 'wavegrid') {
      // Wave Grid mode: 2D grid of points, animated like water
      const gridSize = 24;
      const spacing = 1.2 * this.visualOptions.size;
      const geometry = new THREE.PlaneGeometry(gridSize * spacing, gridSize * spacing, gridSize - 1, gridSize - 1);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshStandardMaterial({ color: this.visualOptions.color, wireframe: true, flatShading: true });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.waveGridMesh = mesh;
    }
    else if (this.visualMode === 'textdeform') {
      // Text/Logo Deform mode: render 3D text and deform it
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font: any) => {
        const geometry = new TextGeometry('AUDIO', {
          font,
          size: 5 * this.visualOptions.size,
          depth: 1.2 * this.visualOptions.sizeZ,
          curveSegments: 8,
          bevelEnabled: true,
          bevelThickness: 0.3,
          bevelSize: 0.2,
          bevelOffset: 0,
          bevelSegments: 2
        });
        geometry.center();
        const material = new THREE.MeshStandardMaterial({ color: this.visualOptions.color, metalness: 0.7, roughness: 0.3 });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.textDeformMesh = mesh;
      });
    }
    else if (this.visualMode === 'aurora') {
      // Aurora mode: flowing, colorful ribbon mesh
      const width = 24;
      const height = 6;
      const geometry = new THREE.PlaneGeometry(width, height, 64, 16);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshStandardMaterial({
        color: this.visualOptions.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        wireframe: false,
        vertexColors: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 4;
      this.scene.add(mesh);
      this.auroraMesh = mesh;
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
          const baseX = (i - this.bars.length / 2) * (this.visualMode === 'classic' ? 2.0 : 0.5) * this.visualOptions.size;
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
    } else if (this.visualMode === 'spiral') {
      if (this.bars.length) {
        let data = this.audioData;
        if (!data) {
          data = new Uint8Array(this.bars.length);
          const t = Date.now() * 0.002;
          for (let i = 0; i < data.length; i++) {
            data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
          }
        }
        const t = Date.now() * 0.002;
        for (let i = 0; i < this.bars.length; i++) {
          // Color animation
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL((data[i % data.length] / 255) * 0.5, 0, 0);
            }
          }
          // Scale animation
          let scale = (data[i % data.length] / 255) * this.intensity * 6 + 1;
          // Effects
          scale = scale ** (1 + distort);
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          scale += (Math.random() - 0.5) * noise * 2;
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          this.bars[i].scale.y = Math.max(0.1, scale);
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
    else if (this.visualMode === 'radial') {
      if (this.audioData && this.bars.length) {
        const t = Date.now() * 0.002;
        for (let i = 0; i < this.bars.length; i++) {
          // Color animation
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL((this.audioData[i % this.audioData.length] / 255) * 0.5, 0, 0);
            }
          }
          // Scale animation
          let scale = (this.audioData[i % this.audioData.length] / 255) * this.intensity * 6 + 1;
          // Effects
          scale = scale ** (1 + distort);
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          scale += (Math.random() - 0.5) * noise * 2;
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          this.bars[i].scale.y = Math.max(0.1, scale);
        }
      }
    }
    else if (this.visualMode === 'sphere') {
      if (this.bars.length) {
        let data = this.audioData;
        if (!data) {
          data = new Uint8Array(this.bars.length);
          const t = Date.now() * 0.002;
          for (let i = 0; i < data.length; i++) {
            data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
          }
        }
        const t = Date.now() * 0.002;
        for (let i = 0; i < this.bars.length; i++) {
          // Color animation
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL((data[i % data.length] / 255) * 0.5, 0, 0);
            }
          }
          // Scale animation
          let scale = (data[i % data.length] / 255) * this.intensity * 3 + 1;
          // Effects
          scale = scale ** (1 + distort);
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          scale += (Math.random() - 0.5) * noise * 2;
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          this.bars[i].scale.y = Math.max(0.1, scale);
        }
      }
    }
    else if (this.visualMode === 'tunnel') {
      // Animate camera moving through the tunnel
      if (this.bars.length) {
        let data = this.audioData;
        if (!data) {
          data = new Uint8Array(this.bars.length);
          const t = Date.now() * 0.002;
          for (let i = 0; i < data.length; i++) {
            data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
          }
        }
        const t = Date.now() * 0.002;
        // Move camera forward in z, loop
        const tunnelLength = 60 * this.visualOptions.sizeY;
        const camZ = ((t * 10) % tunnelLength) - tunnelLength / 2;
        this.camera.position.set(0, 0, camZ);
        this.camera.lookAt(0, 0, camZ + 10);
        // Animate bar scale
        for (let i = 0; i < this.bars.length; i++) {
          // Color animation
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL((data[i % data.length] / 255) * 0.5, 0, 0);
            }
          }
          // Scale animation
          let scale = (data[i % data.length] / 255) * this.intensity * 2 + 1;
          // Effects
          scale = scale ** (1 + distort);
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          scale += (Math.random() - 0.5) * noise * 2;
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          this.bars[i].scale.y = Math.max(0.1, scale);
        }
      }
    }
    else if (this.visualMode === 'grid') {
      if (this.bars.length) {
        let data = this.audioData;
        if (!data) {
          data = new Uint8Array(this.bars.length);
          const t = Date.now() * 0.002;
          for (let i = 0; i < data.length; i++) {
            data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
          }
        }
        const t = Date.now() * 0.002;
        for (let i = 0; i < this.bars.length; i++) {
          // Color animation
          if (audioReactiveColor) {
            const mat = this.bars[i].material as THREE.MeshStandardMaterial;
            if (mat && mat.color) {
              mat.color.offsetHSL((data[i % data.length] / 255) * 0.5, 0, 0);
            }
          }
          // Scale animation
          let scale = (data[i % data.length] / 255) * this.intensity * 2 + 1;
          // Effects
          scale = scale ** (1 + distort);
          scale += Math.sin(t * (1 + wobble) + i * 0.3) * wobble * 2;
          scale += (Math.random() - 0.5) * noise * 2;
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            scale = Math.round(scale * steps) / steps;
          }
          this.bars[i].scale.y = Math.max(0.1, scale);
        }
      }
    }
    else if (this.visualMode === 'ribbon') {
      if (this.audioData && this.waves.length) {
        const t = Date.now() * 0.002;
        const positions = (this.waves[0].geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          let y = (this.audioData[i % this.audioData.length] / 255 - 0.5) * this.intensity * 10;
          // Distort
          y = Math.sign(y) * Math.abs(y) ** (1 + distort);
          // Wobble
          y += Math.sin(t * (1 + wobble) + i * 0.1) * wobble * 2;
          // Noise
          y += (Math.random() - 0.5) * noise * 2;
          // Digital
          if (digital > 0.05) {
            const steps = Math.round(2 + digital * 10);
            y = Math.round(y * steps) / steps;
          }
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }
    }
    else if (this.visualMode === 'galaxy') {
      if (this.audioData && this.particles) {
        const t = Date.now() * 0.001;
        const positions = (this.particles.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          // Swirl: rotate each star around Y axis, modulated by audio
          const origX = positions.getX(i);
          const origZ = positions.getZ(i);
          const r = Math.sqrt(origX * origX + origZ * origZ);
          const baseAngle = Math.atan2(origZ, origX);
          const audioMod = (this.audioData[i % this.audioData.length] / 255 - 0.5) * 2;
          const swirl = t * (0.2 + 0.8 * audioMod);
          const angle = baseAngle + swirl;
          positions.setX(i, Math.cos(angle) * r);
          positions.setZ(i, Math.sin(angle) * r);
          // Y position: add a little vertical movement
          let y = positions.getY(i);
          y += Math.sin(t + i) * 0.02 * (1 + audioMod);
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }
    }
    else if (this.visualMode === 'blob' && this.blobMesh) {
      let data = this.audioData;
      const geometry = this.blobMesh.geometry as THREE.SphereGeometry;
      if (!data) {
        data = new Uint8Array(128);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      // Animate vertices for organic effect
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        // Get original vertex
        const ox = position.getX(i);
        const oy = position.getY(i);
        const oz = position.getZ(i);
        // Calculate spherical radius
        const r = Math.sqrt(ox*ox + oy*oy + oz*oz);
        // Use audio + noise for morph
        const audioIdx = i % data.length;
        const audioVal = (data[audioIdx] / 255);
        const noise = Math.sin(t + i * 0.15) * 0.2 + Math.cos(t * 0.7 + i * 0.07) * 0.1;
        const scale = 1 + audioVal * this.intensity * 0.5 + noise * 0.3;
        position.setXYZ(i, ox * scale, oy * scale, oz * scale);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      // Animate color if enabled
      if (this.visualOptions.colorAnimated) {
        const mat = this.blobMesh.material as THREE.MeshStandardMaterial;
        mat.color.offsetHSL(Math.sin(t) * 0.1, 0, 0);
      }
    }
    else if (this.visualMode === 'dna' && this.dnaObjects) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(32);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const baseCount = this.dnaObjects.spheres.length / 2;
      const helixRadius = 6 * this.visualOptions.size * (1 + Math.sin(t) * 0.05);
      const helixHeight = 18 * this.visualOptions.sizeY;
      const turns = 3;
      for (let i = 0; i < baseCount; i++) {
        const tt = i / baseCount;
        const angle = turns * Math.PI * 2 * tt + Math.sin(t + i * 0.1) * 0.2 * (data[i % data.length] / 255);
        // Audio-reactive radius
        const radiusMod = 1 + (data[i % data.length] / 255 - 0.5) * 0.3 * this.intensity;
        // Spiral 1
        const x1 = Math.cos(angle) * helixRadius * radiusMod;
        const y1 = -helixHeight / 2 + helixHeight * tt;
        const z1 = Math.sin(angle) * helixRadius * radiusMod;
        // Spiral 2
        const x2 = Math.cos(angle + Math.PI) * helixRadius * radiusMod;
        const y2 = y1;
        const z2 = Math.sin(angle + Math.PI) * helixRadius * radiusMod;
        // Move spheres
        this.dnaObjects.spheres[i * 2].position.set(x1, y1, z1);
        this.dnaObjects.spheres[i * 2 + 1].position.set(x2, y2, z2);
        // Update connecting line
        const line = this.dnaObjects.lines[i];
        const positions = (line.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, x1, y1, z1);
        positions.setXYZ(1, x2, y2, z2);
        positions.needsUpdate = true;
      }
    }
    else if (this.visualMode === 'liquid' && this.liquidDrops) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(this.liquidDrops.length);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const dropCount = this.liquidDrops.length;
      for (let i = 0; i < dropCount; i++) {
        const mesh = this.liquidDrops[i];
        // Orbiting positions
        const angle = (i / dropCount) * Math.PI * 2 + t * 0.7 + Math.sin(t + i) * 0.2;
        const radius = 7 + Math.sin(t * 0.8 + i) * 1.5 + (data[i % data.length] / 255) * 2 * this.intensity;
        mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(t + i) * 2);
        // Pulse scale
        const scale = 1 + (data[i % data.length] / 255 - 0.5) * 0.7 * this.intensity + Math.sin(t * 2 + i) * 0.1;
        mesh.scale.set(scale, scale, scale);
      }
      // TODO: For a true metaball/merging effect, a custom shader or postprocessing pass is needed. For now, overlapping transparent spheres simulate merging.
    }
    else if (this.visualMode === 'orbitals' && this.orbitalsObjects) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(this.orbitalsObjects.electrons.length);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const electronCount = this.orbitalsObjects.electrons.length;
      for (let i = 0; i < electronCount; i++) {
        const electron = this.orbitalsObjects.electrons[i];
        // Each electron orbits in a different plane
        const baseRadius = 6 + (i % 3) * 2 + (data[i % data.length] / 255) * 2 * this.intensity;
        const speed = 0.7 + (i % 3) * 0.2 + (data[i % data.length] / 255) * 0.5 * this.intensity;
        const phase = (i / electronCount) * Math.PI * 2;
        // Plane rotation
        const planeAngle = (i * Math.PI * 2) / electronCount;
        // Orbit position
        const x = Math.cos(t * speed + phase) * baseRadius;
        const y = Math.sin(t * speed + phase) * baseRadius * Math.cos(planeAngle);
        const z = Math.sin(t * speed + phase) * baseRadius * Math.sin(planeAngle);
        electron.position.set(x, y, z);
      }
      // Nucleus can pulse with the average audio
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
      const nucleusScale = 1 + avg * 0.5 * this.intensity + Math.sin(t * 2) * 0.05;
      this.orbitalsObjects.nucleus.scale.set(nucleusScale, nucleusScale, nucleusScale);
    }
    else if (this.visualMode === 'fractal' && this.fractalTreeLines) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(32);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      // Animate branch swaying by updating geometry
      const t = Date.now() * 0.002;
      let idx = 0;
      for (const line of this.fractalTreeLines) {
        const positions = (line.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        // Sway the end point
        const sway = Math.sin(t * 1.5 + idx) * 0.5 + (data[idx % data.length] / 255 - 0.5) * 1.2 * this.intensity;
        const x0 = positions.getX(0);
        const y0 = positions.getY(0);
        const z0 = positions.getZ(0);
        const x1 = positions.getX(1) + sway * 0.2;
        const y1 = positions.getY(1);
        const z1 = positions.getZ(1) + sway * 0.2;
        positions.setXYZ(1, x1, y1, z1);
        positions.needsUpdate = true;
        idx++;
      }
    }
    else if (this.visualMode === 'polygon' && this.polygonLine) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(32);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      // Morph between polygons: triangle, square, pentagon, hexagon, etc.
      const morphSpeed = 0.5;
      const morph = (Math.sin(t * morphSpeed) + 1) * 0.5; // 0..1
      const minSides = 3;
      const maxSides = 8;
      const sidesF = minSides + (maxSides - minSides) * morph;
      const sides = Math.round(sidesF);
      const radius = 8 * this.visualOptions.size * (1 + Math.sin(t * 1.2) * 0.1);
      const points = [];
      for (let i = 0; i <= sides; i++) {
        // Audio-reactive radius per vertex
        const audioIdx = i % data.length;
        const audioVal = (data[audioIdx] / 255);
        const r = radius * (1 + (audioVal - 0.5) * 0.3 * this.intensity);
        const angle = (i / sides) * Math.PI * 2 + Math.sin(t + i) * 0.05;
        points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
      }
      const geometry = this.polygonLine.geometry as THREE.BufferGeometry;
      geometry.setFromPoints(points);
      geometry.attributes.position.needsUpdate = true;
    }
    else if (this.visualMode === 'wavegrid' && this.waveGridMesh) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(128);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const geometry = this.waveGridMesh.geometry as THREE.PlaneGeometry;
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        // Grid coordinates
        const ix = i % geometry.parameters.widthSegments;
        const iz = Math.floor(i / geometry.parameters.widthSegments);
        // Audio-reactive height
        const audioIdx = (ix + iz) % data.length;
        const audioVal = (data[audioIdx] / 255);
        // Wave math
        const wave = Math.sin(t * 2 + ix * 0.3 + iz * 0.4) * 0.7 + Math.cos(t + ix * 0.2 - iz * 0.2) * 0.5;
        const y = (audioVal - 0.5) * 2 * this.intensity + wave * 0.7 * this.intensity;
        position.setY(i, y);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    else if (this.visualMode === 'textdeform' && this.textDeformMesh) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(128);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const geometry = this.textDeformMesh.geometry as THREE.BufferGeometry;
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        // Get original vertex
        const ox = position.getX(i);
        const oy = position.getY(i);
        const oz = position.getZ(i);
        // Audio-reactive deformation
        const audioIdx = i % data.length;
        const audioVal = (data[audioIdx] / 255);
        const noise = Math.sin(t + i * 0.13) * 0.2 + Math.cos(t * 0.7 + i * 0.07) * 0.1;
        const deform = 1 + audioVal * this.intensity * 0.4 + noise * 0.2;
        position.setXYZ(i, ox * deform, oy * deform, oz * deform);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    else if (this.visualMode === 'aurora' && this.auroraMesh) {
      let data = this.audioData;
      if (!data) {
        data = new Uint8Array(128);
        const t = Date.now() * 0.002;
        for (let i = 0; i < data.length; i++) {
          data[i] = 128 + Math.round(127 * Math.sin(i * 0.2 + t));
        }
      }
      const t = Date.now() * 0.002;
      const geometry = this.auroraMesh.geometry as THREE.PlaneGeometry;
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        // Grid coordinates
        const ix = i % (geometry.parameters.widthSegments + 1);
        const iz = Math.floor(i / (geometry.parameters.widthSegments + 1));
        // Audio-reactive height
        const audioIdx = (ix + iz) % data.length;
        const audioVal = (data[audioIdx] / 255);
        // Flowing wave math
        const wave = Math.sin(t * 1.5 + ix * 0.25 + iz * 0.5) * 1.2 + Math.cos(t * 0.7 + ix * 0.13 - iz * 0.18) * 0.7;
        const y = (audioVal - 0.5) * 3 * this.intensity + wave * 1.2 * this.intensity;
        position.setY(i, y);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      // Animate color (hue shift)
      const mat = this.auroraMesh.material as THREE.MeshStandardMaterial;
      const baseColor = new THREE.Color(this.visualOptions.color);
      baseColor.offsetHSL(Math.sin(t * 0.2) * 0.2, 0.2, 0.1);
      mat.color.copy(baseColor);
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
    this.dnaObjects = null; // Clear DNA objects on dispose
    this.liquidDrops = null; // Clear liquid drops on dispose
    this.orbitalsObjects = null; // Clear orbitals objects on dispose
    this.fractalTreeLines = null; // Clear fractal tree lines on dispose
    this.polygonLine = null; // Clear polygon line on dispose
    this.waveGridMesh = null; // Clear wave grid mesh on dispose
    this.textDeformMesh = null; // Clear text deform mesh on dispose
    this.auroraMesh = null; // Clear aurora mesh on dispose
  }
} 