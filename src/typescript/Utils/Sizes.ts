import EventEmitter from './EventEmitter';

export default class Sizes extends EventEmitter {
  /** Viewport */
  public readonly viewport: {width: number; height: number; aspect: number};
  /** Viewport size */
  private readonly $sizeViewport: HTMLDivElement;
  /** Window inner width */
  public width!: number;
  /** Window inner height */
  public height!: number;

  /**
   * Constructor
   */
  constructor() {
    super();

    // Viewport size
    this.viewport = {width: 0, height: 0, aspect: 0};
    this.$sizeViewport = document.createElement('div');
    this.$sizeViewport.style.width = '100vw';
    this.$sizeViewport.style.height = '100vh';
    this.$sizeViewport.style.position = 'absolute';
    this.$sizeViewport.style.top = '0';
    this.$sizeViewport.style.left = '0';
    this.$sizeViewport.style.pointerEvents = 'none';

    // Resize event
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);

    this.resize();
  }

  /**
   * Resize
   */
  private resize() {
    document.body.appendChild(this.$sizeViewport);
    this.viewport.width = this.$sizeViewport.offsetWidth;
    this.viewport.height = this.$sizeViewport.offsetHeight;
    this.viewport.aspect = this.viewport.width / this.viewport.height;
    document.body.removeChild(this.$sizeViewport);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.trigger('resize', null);
  }
}
