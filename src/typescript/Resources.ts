import * as THREE from 'three'

import Loader from './Utils/Loader'
import EventEmitter from './Utils/EventEmitter'

export default class Resources extends EventEmitter
{
  /** Loader to load all item and texture resources */
  loader: Loader
  /** Items that are currently loaded */
  items: {
    [key: string]: {
      scene: THREE.Group,
      scenes: THREE.Group[],
      animations: any,
      cameras: THREE.Camera[],
      asset: any,
      parser: any,
      userData: any,
    }
  }
  /** Textures that are currently loaded */
  textures: {
    [key: string]: THREE.Texture
  }

  constructor()
  {
    super()

    this.loader = new Loader()
    this.items = {}
    this.textures = {}

    this.loader.load([
      { name: 'shipDark', source: 'src/models/pirateKit/ship_dark.gltf' },
      { name: 'palmDetailedLong', source: 'src/models/pirateKit/palm_detailed_long.gltf' },
      { name: 'palmDetailedShort', source: 'src/models/pirateKit/palm_detailed_short.gltf' },
      { name: 'shipWreck', source: 'src/models/pirateKit/ship_wreck.gltf' },
      { name: 'tower', source: 'src/models/pirateKit/tower.gltf' },
      { name: 'formationLargeStone', source: 'src/models/pirateKit/formationLarge_stone.gltf' },
      { name: 'formationLargeRock', source: 'src/models/pirateKit/formationLarge_rock.gltf' },
      { name: 'formationRock', source: 'src/models/pirateKit/formation_rock.gltf' },
      { name: 'formationStone', source: 'src/models/pirateKit/formation_stone.gltf' },
      { name: 'pirateCaptain', source: 'src/models/pirateKit/pirate_captain.gltf' },
    ])

    this.loader.on('fileEnd', (_resource, _data) =>
    {
      if(_resource.type === 'texture')
      {
        this.textures[`${_resource.name}`] = _data
      }
      else
      {
        this.items[_resource.name] = _data
      }

      // Trigger progress
      this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
    })

    this.loader.on('end', () =>
    {
      // Trigger ready
      this.trigger('ready', null)
    })
  }
}