import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';
import EventEmitter from '../Utils/EventEmitter';

export default class Controls extends EventEmitter {
  // Utilities
  /** Time */
  time: Time;
  /** Sizes */
  sizes: Sizes;

  // Functionality
  /** Config */
  config: {debug: boolean};
  /** Debug */
  debug: dat.GUI;

  // Controls Functionality
  /** Actions */
  actions!: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    interact: boolean;
  };
  /** Keyboard */
  keyboard!: {
    events: {
      keyUp: ((event: KeyboardEvent) => void) | undefined;
      keyDown: ((event: KeyboardEvent) => void) | undefined;
    };
  };

  constructor(_params: {
    time: Time;
    sizes: Sizes;
    config: {debug: boolean};
    debug: dat.GUI;
  }) {
    super();

    this.time = _params.time;
    this.sizes = _params.sizes;
    this.config = _params.config;
    this.debug = _params.debug;

    this.setActions();
    this.setKeyboard();
  }

  setActions() {
    this.actions = {
      up: false,
      right: false,
      down: false,
      left: false,
      interact: false,
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.actions.up = false;
        this.actions.right = false;
        this.actions.down = false;
        this.actions.left = false;
        this.actions.interact = false;
      }
    });
  }

  setKeyboard() {
    this.keyboard = {
      events: {
        keyUp: undefined,
        keyDown: undefined,
      },
    };

    this.keyboard.events.keyDown = _event => {
      switch (_event.key) {
        case 'ArrowUp':
        case 'w':
          this.actions.up = true;
          break;

        case 'ArrowRight':
        case 'd':
          this.actions.right = true;
          break;

        case 'ArrowDown':
        case 's':
          this.actions.down = true;
          break;

        case 'ArrowLeft':
        case 'a':
          this.actions.left = true;
          break;

        case 'Control':
        case 'Enter':
        case 'e':
        case ' ':
          this.actions.interact = true;
          break;
      }
    };

    this.keyboard.events.keyUp = _event => {
      switch (_event.key) {
        case 'ArrowUp':
        case 'z':
        case 'w':
          this.actions.up = false;
          break;

        case 'ArrowRight':
        case 'd':
          this.actions.right = false;
          break;

        case 'ArrowDown':
        case 's':
          this.actions.down = false;
          break;

        case 'ArrowLeft':
        case 'q':
        case 'a':
          this.actions.left = false;
          break;

        case 'Control':
        case 'Enter':
        case 'e':
        case ' ':
          this.actions.interact = false;
          break;
      }
    };

    document.addEventListener('keydown', this.keyboard.events.keyDown);
    document.addEventListener('keyup', this.keyboard.events.keyUp);
  }
}
