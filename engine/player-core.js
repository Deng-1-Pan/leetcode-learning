/**
 * A DOM-independent cursor over immutable algorithm trace frames.
 */
export class TracePlayer extends EventTarget {
  #trace;
  #currentStep = 0;
  #timerId = null;

  constructor(trace) {
    super();
    if (!trace || !Array.isArray(trace.frames) || trace.frames.length === 0) {
      throw new TypeError('TracePlayer requires a trace with at least one frame.');
    }
    this.#trace = trace;
  }

  get trace() {
    return this.#trace;
  }

  get currentStep() {
    return this.#currentStep;
  }

  get frame() {
    return this.#trace.frames[this.#currentStep];
  }

  get isPlaying() {
    return this.#timerId !== null;
  }

  next() {
    return this.goToStep(this.#currentStep + 1);
  }

  prev() {
    return this.goToStep(this.#currentStep - 1);
  }

  goToStep(step) {
    const nextStep = Math.min(this.#trace.frames.length - 1, Math.max(0, Number(step) || 0));
    if (nextStep === this.#currentStep) return this.frame;

    this.#currentStep = nextStep;
    this.#emitStepChange();
    return this.frame;
  }

  play(speedMs = 700) {
    if (this.isPlaying || this.#currentStep === this.#trace.frames.length - 1) return;
    const interval = Math.max(16, Number(speedMs) || 700);
    this.#timerId = setInterval(() => {
      if (this.#currentStep === this.#trace.frames.length - 1) {
        this.pause();
        return;
      }
      this.next();
      if (this.#currentStep === this.#trace.frames.length - 1) this.pause();
    }, interval);
    this.dispatchEvent(new CustomEvent('play-state-change', { detail: { isPlaying: true } }));
  }

  pause() {
    if (!this.isPlaying) return;
    clearInterval(this.#timerId);
    this.#timerId = null;
    this.dispatchEvent(new CustomEvent('play-state-change', { detail: { isPlaying: false } }));
  }

  reset() {
    this.pause();
    return this.goToStep(0);
  }

  destroy() {
    this.pause();
  }

  #emitStepChange() {
    this.dispatchEvent(new CustomEvent('step-change', {
      detail: { step: this.#currentStep, frame: this.frame },
    }));
  }
}
