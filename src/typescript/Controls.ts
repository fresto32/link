import Time from './Utils/Time';
import Sizes from './Utils/Sizes';
import EventEmitter from './Utils/EventEmitter';

export default class Controls extends EventEmitter {
  // Utilities
  /** Time */
  readonly time: Time;
  /** Sizes */
  readonly sizes: Sizes;

  // Functionality
  /** Config */
  readonly config: {debug: boolean};
  /** Debug */
  readonly debug: dat.GUI;

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
    const setupJoystick = (
      joystick: Partial<Joystick>,
      side: 'right' | 'left'
    ) => {
      joystick.active = false;

      // Element
      // Place a semi transparent white background div behind the controls...
      joystick.$background = document.createElement('div');
      joystick.$background.style.userSelect = 'none';
      joystick.$background.style.position = 'fixed';
      joystick.$background.style.bottom = '10px';
      $(joystick.$background).css(side, '10px');
      joystick.$background.style.width = '170px';
      joystick.$background.style.height = '170px';
      joystick.$background.style.borderRadius = '50%';
      joystick.$background.style.transition = 'opacity 0.3s 0.0s';
      joystick.$background.style.willChange = 'opacity';
      joystick.$background.style.backgroundColor = '#ffffff';
      joystick.$background.style.opacity = '0.5';
      document.body.appendChild(joystick.$background);

      joystick.$element = joystick.$background.cloneNode() as HTMLDivElement;
      joystick.$element.style.backgroundColor = '';
      joystick.$element.style.opacity = '0';
      document.body.appendChild(joystick.$element);

      joystick.$cursor = document.createElement('div');
      joystick.$cursor.style.position = 'absolute';
      joystick.$cursor.style.top = 'calc(50% - 30px)';
      joystick.$cursor.style.left = 'calc(50% - 30px)';
      joystick.$cursor.style.width = '60px';
      joystick.$cursor.style.height = '60px';
      joystick.$cursor.style.border = '2px solid #000000';
      joystick.$cursor.style.borderRadius = '50%';
      joystick.$cursor.style.boxSizing = 'border-box';
      joystick.$cursor.style.pointerEvents = 'none';
      joystick.$cursor.style.willChange = 'transform';
      joystick.$element.appendChild(joystick.$cursor);

      joystick.$limit = document.createElement('div');
      joystick.$limit.style.position = 'absolute';
      joystick.$limit.style.top = 'calc(50% - 75px)';
      joystick.$limit.style.left = 'calc(50% - 75px)';
      joystick.$limit.style.width = '150px';
      joystick.$limit.style.height = '150px';
      joystick.$limit.style.border = '2px solid #000000';
      joystick.$limit.style.borderRadius = '50%';
      joystick.$limit.style.opacity = '0.50';
      joystick.$limit.style.pointerEvents = 'none';
      joystick.$limit.style.boxSizing = 'border-box';
      joystick.$element.appendChild(joystick.$limit);

      // Angle
      joystick.angle!.offset = Math.PI * 0.18;

      joystick.angle!.center.x = 0;
      joystick.angle!.center.y = 0;

      joystick.angle!.current.x = 0;
      joystick.angle!.current.y = 0;

      joystick.angle!.originalValue = 0;
      joystick.angle!.value = -Math.PI * 0.5;

      // Resize
      joystick.resize = () => {
        const boundings = joystick.$element!.getBoundingClientRect();

        joystick.angle!.center.x = boundings.left + boundings.width * 0.5;
        joystick.angle!.center.y = boundings.top + boundings.height * 0.5;
      };

      this.sizes.on('resize', joystick.resize);
      joystick.resize();

      // Time tick
      this.time.on('tick', () => {
        // Joystick active
        if (joystick.active) {
          if (joystick.angle === undefined)
            throw console.error("Joystick's angle is undefined.");

          // Calculate joystick angle
          joystick.angle.originalValue = -Math.atan2(
            joystick.angle.current.y - joystick.angle.center.y,
            joystick.angle.current.x - joystick.angle.center.x
          );
          joystick.angle.value =
            joystick.angle.originalValue + joystick.angle.offset;

          // Update joystick
          const distance = Math.hypot(
            joystick.angle.current.y - joystick.angle.center.y,
            joystick.angle.current.x - joystick.angle.center.x
          );
          let radius = distance;
          if (radius > 20) {
            radius = 20 + Math.log(distance - 20) * 5;
          }
          if (radius > 43) {
            radius = 43;
          }
          const cursorX =
            Math.sin(joystick.angle.originalValue + Math.PI * 0.5) * radius;
          const cursorY =
            Math.cos(joystick.angle.originalValue + Math.PI * 0.5) * radius;
          joystick.$cursor!.style.transform = `translateX(${cursorX}px) translateY(${cursorY}px)`;
        }
      });

      // Events
      joystick.touchIdentifier = null;
      joystick.events!.touchstart = (_event: TouchEvent) => {
        _event.preventDefault();

        const touch = _event.changedTouches[0];

        if (touch) {
          joystick.active = true;

          joystick.touchIdentifier = touch.identifier;

          joystick.angle!.current.x = touch.clientX;
          joystick.angle!.current.y = touch.clientY;

          joystick.$limit!.style.opacity = '0.5';

          document.addEventListener('touchend', joystick.events!.touchend!);
          document.addEventListener('touchmove', joystick.events!.touchmove!, {
            passive: false,
          });

          this.trigger('joystickStart', null);
        }
      };

      joystick.events!.touchmove = _event => {
        _event.preventDefault();

        const touches: Touch[] = [];
        for (let i = 0; i < _event.changedTouches.length; i++)
          touches.push(_event.changedTouches[i]);
        const touch = touches.find(
          _touch => _touch.identifier === joystick.touchIdentifier
        );

        if (touch) {
          joystick.angle!.current.x = touch.clientX;
          joystick.angle!.current.y = touch.clientY;

          this.trigger('joystickMove', null);
        }
      };

      joystick.events!.touchend = _event => {
        const touches: Touch[] = [];
        for (let i = 0; i < _event.changedTouches.length; i++)
          touches.push(_event.changedTouches[i]);
        const touch = touches.find(
          _touch => _touch.identifier === joystick.touchIdentifier
        );

        if (touch) {
          joystick.active = false;

          joystick.$limit!.style.opacity = '0.25';

          joystick.$cursor!.style.transform = 'translateX(0px) translateY(0px)';

          joystick.angle!.value = 0;

          document.removeEventListener('touchend', joystick.events!.touchend!);

          this.trigger('joystickEnd', null);
        }
      };

      joystick.$element.addEventListener(
        'touchstart',
        joystick.events!.touchstart,
        {passive: false}
      );
    };

    this.touch = new TouchControls();

    setupJoystick(this.touch.joysticks.left, 'left');
    setupJoystick(this.touch.joysticks.right, 'right');

    // Reveal
    this.touch.reveal = () => {
      this.touch.joysticks.left.$element!.style.opacity = '1';
      this.touch.joysticks.right.$element!.style.opacity = '1';

      this.touch.joysticks.left.angle!.value = 0;
      this.touch.joysticks.right.angle!.value = 0;
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
  touchIdentifier: number | null;
  /** Screen resize */
  resize: () => void;
  /** Touch events */
  events: {
    /** Beginning touch */
    touchstart?: (val: TouchEvent) => void;
    /** When touch has ended */
    touchend?: (val: TouchEvent) => void;
    /** When cursor has moved */
    touchmove?: (val: TouchEvent) => void;
  };
}

interface TouchControls {
  /** Joysticks */
  joysticks: {
    left: Partial<Joystick>;
    right: Partial<Joystick>;
  };
  /** Reveal touch controls */
  reveal: () => void;
}

class TouchControls implements TouchControls {
  constructor() {
    this.joysticks = {
      left: {},
      right: {},
    };
    this.joysticks.left = {};
    this.joysticks.right = {};
    this.joysticks.left.angle = {
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

    this.joysticks.right.angle = {
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

    this.joysticks.left.events = {};
    this.joysticks.right.events = {};
  }
}
