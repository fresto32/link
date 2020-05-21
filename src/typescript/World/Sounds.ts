import {Howl, Howler} from 'howler';
import Time from '../Utils/Time';
import SoundsSettings from '../Settings/Types/Sounds';

export default class Sounds {
  // Utilities
  /** Time */
  private readonly time: Time;

  // Functionality
  /** Debug */
  private readonly debug: dat.GUI;
  /** Debug Foler */
  private readonly debugFolder!: dat.GUI;
  /** Sounds Settings */
  private readonly settings: SoundsSettings;
  /** The sound items */
  public readonly items!: {
    name: string;
    minDelta: number;
    volumeMin: number;
    volumeMax: number;
    rateMin: number;
    rateMax: number;
    lastTime: number;
    sounds: Howl[];
  }[];
  /** Master volume of Howler */
  masterVolume!: number;
  /** Whether Howler is muted */
  muted!: boolean;

  constructor(_params: {time: Time; debug: dat.GUI; settings: SoundsSettings}) {
    // Parameters
    this.time = _params.time;
    this.debug = _params.debug;
    this.settings = _params.settings;

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder('sounds');
    }

    // Set up
    this.items = [];

    this.setSettings();
    this.setMasterVolume();
    this.setMute();
  }

  private setSettings() {
    for (const _settings of this.settings.itemSettings) {
      this.add(_settings);
    }
  }

  private setMasterVolume() {
    // Set up
    this.masterVolume = 1;
    Howler.volume(this.masterVolume);

    window.requestAnimationFrame(() => {
      Howler.volume(this.masterVolume);
    });

    // Debug
    if (this.debug) {
      this.debugFolder
        .add(this, 'masterVolume')
        .step(0.001)
        .min(0)
        .max(1)
        .onChange(() => {
          Howler.volume(this.masterVolume);
        });
    }
  }

  private setMute() {
    // Set up
    this.muted = false;
    Howler.mute(this.muted);

    // M Key
    window.addEventListener('keydown', _event => {
      if (_event.key === 'm') {
        this.muted = !this.muted;
        Howler.mute(this.muted);
      }
    });

    // Tab focus / blur
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Howler.mute(true);
      } else {
        Howler.mute(this.muted);
      }
    });

    // Debug
    if (this.debug) {
      this.debugFolder
        .add(this, 'muted')
        .listen()
        .onChange(() => {
          Howler.mute(this.muted);
        });
    }
  }

  private add(_options: {
    name: string;
    minDelta: number;
    volumeMin: number;
    volumeMax: number;
    rateMin: number;
    rateMax: number;
    sounds: string[];
  }) {
    const sounds: Howl[] = [];

    for (const _sound of _options.sounds) {
      const sound = new Howl({
        src: [_sound],
        onload: () => console.log('loaded!'),
        onloaderror: () => console.log('error!'),
      });
      sounds.push(sound);
    }

    const item = {
      name: _options.name,
      minDelta: _options.minDelta,
      volumeMin: _options.volumeMin,
      volumeMax: _options.volumeMax,
      rateMin: _options.rateMin,
      rateMax: _options.rateMax,
      lastTime: 0,
      sounds: sounds,
    };

    this.items.push(item);
  }

  public play(_name: string) {
    const item = this.items.find(_item => _item.name === _name);
    const time = Date.now();

    if (item && time > item.lastTime + item.minDelta) {
      if (item.sounds === null) throw console.error('Item has no sounds.');

      // Find random sound
      const sound = item.sounds[Math.floor(Math.random() * item.sounds.length)];

      // Update volume
      let volume = item.volumeMin;
      volume = Math.pow(volume, 2);
      sound.volume(volume);

      // Play
      sound.play();

      // Save last play time
      item.lastTime = time;
    }
  }
}
