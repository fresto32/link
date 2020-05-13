/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from './EventEmitter';
import {TextureLoader} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';

export default class Loader extends EventEmitter {
  /** Number of items and textures to load */
  public toLoad: number;
  /** Number of items and textures loaded */
  public loaded: number;
  /** Items and textures loaded */
  public items: any;
  /** THREE Loaders that are instantiated */
  private loaders!: {extensions: string[]; action: (arg0: any) => void}[];

  /**
   * Constructor
   */
  constructor() {
    super();

    this.setLoaders();

    this.toLoad = 0;
    this.loaded = 0;
    this.items = {};
  }

  /**
   * Set loaders
   */
  private setLoaders() {
    this.loaders = [];

    // Images
    this.loaders.push({
      extensions: ['jpg', 'png'],
      action: _resource => {
        const textureLoader = new TextureLoader();
        textureLoader.load(_resource.source, texture => {
          this.fileLoadEnd(_resource, texture);
        });
      },
    });

    // Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('draco/');
    dracoLoader.setDecoderConfig({type: 'js'});

    this.loaders.push({
      extensions: ['drc'],
      action: _resource => {
        dracoLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data);

          //DRACOLoader.releaseDecoderModule()
        });
      },
    });

    // GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    this.loaders.push({
      extensions: ['glb', 'gltf'],
      action: _resource => {
        gltfLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data);
        });
      },
    });

    // FBX
    const fbxLoader = new FBXLoader();

    this.loaders.push({
      extensions: ['fbx'],
      action: _resource => {
        fbxLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data);
        });
      },
    });
  }

  /**
   * Load
   */
  public load(_resources: any) {
    for (const _resource of _resources) {
      this.toLoad++;
      const extensionMatch = _resource.source.match(/\.([a-z]+)$/);

      if (typeof extensionMatch[1] !== 'undefined') {
        const extension = extensionMatch[1];
        const loader = this.loaders.find(_loader =>
          _loader.extensions.find(_extension => _extension === extension)
        );

        if (loader) {
          loader.action(_resource);
        } else {
          console.warn(`Cannot found loader for ${_resource}`);
        }
      } else {
        console.warn(`Cannot found extension of ${_resource}`);
      }
    }
  }

  /**
   * File load end
   */
  private fileLoadEnd(_resource: any, _data: any) {
    this.loaded++;
    this.items[_resource.name] = _data;

    this.trigger('fileEnd', [_resource, _data]);

    if (this.loaded === this.toLoad) {
      this.trigger('end', null);
    }
  }
}
