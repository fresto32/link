/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import Loader from './Utils/Loader';
import EventEmitter from './Utils/EventEmitter';
import ResourcesSettings from './Settings/Resources';

export default class Resources extends EventEmitter {
  /** Loader to load all item and texture resources */
  private loader: Loader;
  /** Items that are currently loaded */
  public readonly models: {
    [key: string]: {
      scene: THREE.Group;
      scenes: THREE.Group[];
      animations: any;
      cameras: THREE.Camera[];
      asset: any;
      parser: any;
      userData: any;
    };
  };
  /** Textures that are currently loaded */
  public readonly textures: {
    [key: string]: THREE.Texture;
  };

  constructor(_params: {settings: ResourcesSettings}) {
    super();

    this.loader = new Loader();
    this.models = {};
    this.textures = {};

    this.loader.load([..._params.settings.items]);

    this.loader.on('fileEnd', (_resource: any, _data: any) => {
      if (_resource.type === 'texture') {
        this.textures[`${_resource.name}`] = _data;
      } else {
        this.models[_resource.name] = _data;
      }

      // Trigger progress
      this.trigger('progress', [this.loader.loaded / this.loader.toLoad]);
    });

    this.loader.on('end', () => {
      // Trigger ready
      this.trigger('ready', null);
    });
  }
}
