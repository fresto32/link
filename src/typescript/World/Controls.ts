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
  /** Keyboard Settings*/
  keyboard!: {
    events: {
      keyUp: ((event: KeyboardEvent) => void) | undefined;
      keyDown: ((event: KeyboardEvent) => void) | undefined;
    };
  };
  /** Touch Settings */
  touch!: TouchControls;

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
    this.setKeyboardControls();
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

  setKeyboardControls() {
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

  /**
   * Set Touch Controls
   */
  setTouchControls() {
    this.touch = new TouchControls();
    /**
     * Joystick
     */
    this.touch.joystick.active = false;

    // Element
    // Place a semi transparent white background div behind the controls...
    this.touch.joystick.$background = document.createElement('div');
    this.touch.joystick.$background.style.userSelect = 'none';
    this.touch.joystick.$background.style.position = 'fixed';
    this.touch.joystick.$background.style.bottom = '10px';
    this.touch.joystick.$background.style.left = '10px';
    this.touch.joystick.$background.style.width = '170px';
    this.touch.joystick.$background.style.height = '170px';
    this.touch.joystick.$background.style.borderRadius = '50%';
    this.touch.joystick.$background.style.transition = 'opacity 0.3s 0.0s';
    this.touch.joystick.$background.style.willChange = 'opacity';
    this.touch.joystick.$background.style.backgroundColor = '#ffffff';
    this.touch.joystick.$background.style.opacity = '0.5';
    document.body.appendChild(this.touch.joystick.$background);

    this.touch.joystick.$element = this.touch.joystick.$background.cloneNode() as HTMLDivElement;
    this.touch.joystick.$element.style.backgroundColor = '';
    this.touch.joystick.$element.style.opacity = '0';
    document.body.appendChild(this.touch.joystick.$element);

    this.touch.joystick.$cursor = document.createElement('div');
    this.touch.joystick.$cursor.style.position = 'absolute';
    this.touch.joystick.$cursor.style.top = 'calc(50% - 30px)';
    this.touch.joystick.$cursor.style.left = 'calc(50% - 30px)';
    this.touch.joystick.$cursor.style.width = '60px';
    this.touch.joystick.$cursor.style.height = '60px';
    this.touch.joystick.$cursor.style.border = '2px solid #000000';
    this.touch.joystick.$cursor.style.borderRadius = '50%';
    this.touch.joystick.$cursor.style.boxSizing = 'border-box';
    this.touch.joystick.$cursor.style.pointerEvents = 'none';
    this.touch.joystick.$cursor.style.willChange = 'transform';
    this.touch.joystick.$element.appendChild(this.touch.joystick.$cursor);

    this.touch.joystick.$limit = document.createElement('div');
    this.touch.joystick.$limit.style.position = 'absolute';
    this.touch.joystick.$limit.style.top = 'calc(50% - 75px)';
    this.touch.joystick.$limit.style.left = 'calc(50% - 75px)';
    this.touch.joystick.$limit.style.width = '150px';
    this.touch.joystick.$limit.style.height = '150px';
    this.touch.joystick.$limit.style.border = '2px solid #000000';
    this.touch.joystick.$limit.style.borderRadius = '50%';
    this.touch.joystick.$limit.style.opacity = '0.50';
    this.touch.joystick.$limit.style.pointerEvents = 'none';
    this.touch.joystick.$limit.style.boxSizing = 'border-box';
    this.touch.joystick.$element.appendChild(this.touch.joystick.$limit);

    // Angle
    this.touch.joystick.angle!.offset = Math.PI * 0.18;

    this.touch.joystick.angle!.center.x = 0;
    this.touch.joystick.angle!.center.y = 0;

    this.touch.joystick.angle!.current.x = 0;
    this.touch.joystick.angle!.current.y = 0;

    this.touch.joystick.angle!.originalValue = 0;
    this.touch.joystick.angle!.value = -Math.PI * 0.5;

    // Resize
    this.touch.joystick.resize = () => {
      const boundings = this.touch.joystick.$element!.getBoundingClientRect();

      this.touch.joystick.angle!.center.x =
        boundings.left + boundings.width * 0.5;
      this.touch.joystick.angle!.center.y =
        boundings.top + boundings.height * 0.5;
    };

    this.sizes.on('resize', this.touch.joystick.resize);
    this.touch.joystick.resize();

    // Time tick
    this.time.on('tick', () => {
      // Joystick active
      if (this.touch.joystick.active) {
        if (this.touch.joystick.angle === undefined)
          throw console.error("Joystick's angle is undefined.");

        // Calculate joystick angle
        this.touch.joystick.angle.originalValue = -Math.atan2(
          this.touch.joystick.angle.current.y -
            this.touch.joystick.angle.center.y,
          this.touch.joystick.angle.current.x -
            this.touch.joystick.angle.center.x
        );
        this.touch.joystick.angle.value =
          this.touch.joystick.angle.originalValue +
          this.touch.joystick.angle.offset;

        // Update joystick
        const distance = Math.hypot(
          this.touch.joystick.angle.current.y -
            this.touch.joystick.angle.center.y,
          this.touch.joystick.angle.current.x -
            this.touch.joystick.angle.center.x
        );
        let radius = distance;
        if (radius > 20) {
          radius = 20 + Math.log(distance - 20) * 5;
        }
        if (radius > 43) {
          radius = 43;
        }
        const cursorX =
          Math.sin(this.touch.joystick.angle.originalValue + Math.PI * 0.5) *
          radius;
        const cursorY =
          Math.cos(this.touch.joystick.angle.originalValue + Math.PI * 0.5) *
          radius;
        this.touch.joystick.$cursor!.style.transform = `translateX(${cursorX}px) translateY(${cursorY}px)`;
      }
    });

    // Events
    this.touch.joystick.touchIdentifier = null;
    this.touch.joystick.events!.touchstart = _event => {
      _event.preventDefault();

      const touch = _event.changedTouches[0];

      if (touch) {
        this.touch.joystick.active = true;

        this.touch.joystick.touchIdentifier = touch.identifier;

        this.touch.joystick.angle!.current.x = touch.clientX;
        this.touch.joystick.angle!.current.y = touch.clientY;

        this.touch.joystick.$limit!.style.opacity = '0.5';

        document.addEventListener(
          'touchend',
          this.touch.joystick.events!.touchend!
        );
        document.addEventListener(
          'touchmove',
          this.touch.joystick.events!.touchmove!,
          {passive: false}
        );

        this.trigger('joystickStart', null);
      }
    };

    this.touch.joystick.events!.touchmove = _event => {
      _event.preventDefault();

      const touches = [..._event.changedTouches];
      const touch = touches.find(
        _touch => _touch.identifier === this.touch.joystick.touchIdentifier
      );

      if (touch) {
        this.touch.joystick.angle!.current.x = touch.clientX;
        this.touch.joystick.angle!.current.y = touch.clientY;

        this.trigger('joystickMove', null);
      }
    };

    this.touch.joystick.events!.touchend = _event => {
      const touches = [..._event.changedTouches];
      const touch = touches.find(
        _touch => _touch.identifier === this.touch.joystick.touchIdentifier
      );

      if (touch) {
        this.touch.joystick.active = false;

        this.touch.joystick.$limit!.style.opacity = '0.25';

        this.touch.joystick.$cursor!.style.transform =
          'translateX(0px) translateY(0px)';

        this.touch.joystick.angle!.value = 0;

        document.removeEventListener(
          'touchend',
          this.touch.joystick.events!.touchend!
        );

        this.trigger('joystickEnd', null);
      }
    };

    this.touch.joystick.$element.addEventListener(
      'touchstart',
      this.touch.joystick.events!.touchstart,
      {passive: false}
    );

    // Reveal
    this.touch.reveal = () => {
      this.touch.joystick.$element!.style.opacity = '1';
      this.touch.joystick.angle!.value = 0;
    };
  }
}

interface Joystick {
  /** Whether the joystick is currently active */
  active: boolean;
  /** The div that contains the cursor and limit controls */
  $element: HTMLDivElement;
  /** A background div for $element */
  $background: HTMLDivElement;
  /** The cursor which the user can swivel around */
  $cursor: HTMLDivElement;
  /** The limit to which the cursor can move */
  $limit: HTMLDivElement;
  /** The angle of the cursor */
  angle: {
    offset: number;
    center: {
      x: number;
      y: number;
    };
    current: {
      x: number;
      y: number;
    };
    originalValue: number;
    value: number;
  };
  /** Identifier of the touch */
  touchIdentifier: (() => void) | null;
  /** Screen resize */
  resize: () => void;
  /** Touch events */
  events: {
    /** Beginning touch */
    touchstart?: (val: any) => void;
    /** When touch has ended */
    touchend?: (val: any) => void;
    /** When cursor has moved */
    touchmove?: (val: any) => void;
  };
}

interface TouchControls {
  /** Joystick */
  joystick: Partial<Joystick>;
  /** Reveal touch controls */
  reveal: () => void;
}

class TouchControls implements TouchControls {
  constructor() {
    this.joystick = {};
    this.joystick.angle = {
      offset: 0,
      center: {
        x: 0,
        y: 0,
      },
      current: {
        x: 0,
        y: 0,
      },
      originalValue: 0,
      value: 0,
    };
    this.joystick.events = {};
  }
}
