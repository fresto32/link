import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
  /** start time */
  private start: number;
  /** current time */
  private current: number;
  /** animation frame */
  private ticker!: number;
  /** time since last tick */
  public delta: number;

  /**
   * Constructor
   */
  constructor() {
    super();

    // Set up
    this.start = Date.now();
    this.current = this.start;
    this.delta = 16;

    this.tick = this.tick.bind(this);
    this.tick();
  }

  /**
   * Tick
   */
  private tick() {
    this.ticker = window.requestAnimationFrame(this.tick);

    const current = Date.now();

    this.delta = current - this.current;
    this.current = current;

    if (this.delta > 60) this.delta = 60;

    this.trigger('tick', null);
  }

  /**
   * Stop
   */
  public stop() {
    window.cancelAnimationFrame(this.ticker);
  }
}
