import Time from '../Utils/Time'
import Sizes from '../Utils/Sizes'
import EventEmitter from '../Utils/EventEmitter'

export default class Controls extends EventEmitter
{
  // Utilities
  /** Time */
  time: Time
  /** Sizes */
  sizes: Sizes

  // Functionality
  /** Config */
  config: {debug: boolean}
  /** Debug */
  debug: dat.GUI

  // Controls Functionality
  /** Actions */
  actions: {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
  }
  /** Keyboard */
  keyboard: {
    events: {
      keyUp: (KeyboardEvent) => void
      keyDown: (KeyboardEvent) => void
    }
  }
  

  constructor(
    _params: {
      time: Time,
      sizes: Sizes,
      config: {debug: boolean},
      debug: dat.GUI,
    })
  {
    super()

    this.time = _params.time
    this.sizes = _params.sizes
    this.config = _params.config
    this.debug = _params.debug

    this.setActions()
    this.setKeyboard()
  }

  setActions()
  {
    this.actions = {up: null, right: null, down: null, left: null}
    this.actions.up = false
    this.actions.right = false
    this.actions.down = false
    this.actions.left = false

    document.addEventListener('visibilitychange', () =>
    {
      if(!document.hidden)
      {
        this.actions.up = false
        this.actions.right = false
        this.actions.down = false
        this.actions.left = false
      }
    })
  }

  setKeyboard()
  {
    this.keyboard = {
      events: {
        keyUp: null,
        keyDown: null
      }
    }

    this.keyboard.events.keyDown = (_event) =>
    {
      switch(_event.key)
      {
        case 'ArrowUp':
        case 'z':
        case 'w':
          this.actions.up = true
          break

        case 'ArrowRight':
        case 'd':
          this.actions.right = true
          break

        case 'ArrowDown':
        case 's':
          this.actions.down = true
          break

        case 'ArrowLeft':
        case 'q':
        case 'a':
          this.actions.left = true
          break
      }
    }

    this.keyboard.events.keyUp = (_event) =>
    {
      switch(_event.key)
      {
        case 'ArrowUp':
        case 'z':
        case 'w':
          this.actions.up = false
          break

        case 'ArrowRight':
        case 'd':
          this.actions.right = false
          break

        case 'ArrowDown':
        case 's':
          this.actions.down = false
          break

        case 'ArrowLeft':
        case 'q':
        case 'a':
          this.actions.left = false
          break
      }
    }

    document.addEventListener('keydown', this.keyboard.events.keyDown)
    document.addEventListener('keyup', this.keyboard.events.keyUp)
  }
}