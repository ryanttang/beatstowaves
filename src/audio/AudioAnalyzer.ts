export class AudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;
  private subscribers: ((data: Uint8Array) => void)[] = [];

  /**
   * Initialize the analyzer with an HTMLAudioElement.
   * @param audioEl The HTMLAudioElement to analyze.
   */
  init(audioEl: HTMLAudioElement) {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.source = this.audioCtx.createMediaElementSource(audioEl);
    this.analyser = this.audioCtx.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  subscribe(cb: (data: Uint8Array) => void) {
    this.subscribers.push(cb);
  }

  start() {
    if (!this.analyser || !this.dataArray) return;
    const loop = () => {
      this.analyser!.getByteFrequencyData(this.dataArray!);
      this.subscribers.forEach(cb => cb(this.dataArray!));
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.source = null;
    this.analyser = null;
    this.dataArray = null;
  }
} 