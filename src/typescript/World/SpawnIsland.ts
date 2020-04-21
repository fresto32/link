import * as THREE from 'three'
import Resources from '../Resources'
import ObjectDimensions from './Helpers/ObjectDimensions'

export default class SpawnIsland
{
  /** Container */
  container: THREE.Object3D
  /** Background Mesh */
  background: THREE.Mesh
  /** Border Mesh */
  border: THREE.Mesh
  /** Resources */
  resources: Resources

  constructor(_params: {resources: Resources})
  {
    // Container
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = true

    // Params
    this.resources = _params.resources

    // Setting up scenegraph
    this.setBackground()
    this.setBorder()
    this.setPirateBoat()
    this.setPalmTrees()
    this.setShipWreck()
    this.setTower()
    this.setRockFormations()
    this.setGrassTufts()
  }

  /**
   * Set Background
   * 
   * The background for the spawn island is a single sided plane.
   */
  setBackground()
  {
    const texture = this.resources.textures.grass
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.x = 10
    texture.repeat.y = 10

    const backgroundMaterial = 
      new THREE.MeshPhongMaterial(
        {
          map: texture,
          emissive: 'green'
        })

    const backgroundGeometry = new THREE.PlaneBufferGeometry(300, 200, 10, 10);
    this.background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    this.background.rotateX(-Math.PI / 2)
    this.background.position.y = 0.5
    this.container.add(this.background)
  }

  /**
   * Set Border
   * 
   * The border is a single sided plane that is slightly larger than the 
   * background plane.
   */
  setBorder()
  {
    const fenceVertical = this.resources.items.fence.scene.clone()
    this.setScale(fenceVertical)
    const fenceHorizontal = fenceVertical.clone().rotateY(Math.PI / 2)

    const dimensions = ObjectDimensions(fenceHorizontal)

    // Build fences for each side of the map...
    // +z side
    for (let i = -155; i < 145; i += dimensions.z)
    {
      const fence = fenceVertical.clone()
      fence.position.set(i, 0.5, 95)
      this.container.add(fence)
    }
    // -z side
    for (let i = -155; i < 145; i += dimensions.z)
    {
      const fence = fenceVertical.clone()
      fence.position.set(i, 0.5, -105)
      this.container.add(fence)
    }
    // +x side
    for (let i = -91; i <= 105; i += dimensions.z)
    {
      const fence = fenceHorizontal.clone()
      fence.position.set(145, 0.5, i)
      this.container.add(fence)
    }
    // -x side
    for (let i = -91; i <= 105; i += dimensions.z)
    {
      const fence = fenceHorizontal.clone()
      fence.position.set(-155, 0.5, i)
      this.container.add(fence)
    }
  }

  /**
   * Set Pirate Boat
   * 
   * Sets a pirate boat in the upper right quadrant.
   */
  setPirateBoat()
  {
    const shipDark = this.resources.items.shipDark.scene.children[0]
    this.setScale(shipDark)
    shipDark.position.set(75, 0.6, 50)
    this.container.add(shipDark)
  }

  /**
   * Set Palm Trees
   * 
   * Sets some palm trees in the bottom right quadrant
   */
  setPalmTrees()
  {
    const palmShortModel = this.resources.items.palmShort.scene.children[0]
    const palmLongModel = this.resources.items.palmLong.scene.children[0]

    this.setScale(palmShortModel)
    this.setScale(palmLongModel)

    palmShortModel.position.set(75, 0.6, -50)
    palmLongModel.position.set(75, 0.6, -48)

    for (let i = 0; i < 80; i++) 
    {
      const palmShort = new THREE.Object3D()
      palmShort.copy(palmShortModel)
      palmShort.position.x += Math.random() * 60 * (Math.random() > 0.5? -1 : 1)
      palmShort.position.z += Math.random() * 40 * (Math.random() > 0.5? -1 : 1)

      const palmLong = new THREE.Object3D()
      palmLong.copy(palmLongModel)
      palmLong.position.x += Math.random() * 60 * (Math.random() > 0.5? -1 : 1)
      palmLong.position.z += Math.random() * 40 * (Math.random() > 0.5? -1 : 1)

      this.container.add(palmShort)
      this.container.add(palmLong)
    }
  }

  /**
   * Set Ship Wreck
   * 
   * Sets a ship wreck in the bottom left hand quadrant.
   */
  setShipWreck()
  {
    const shipWreck = this.resources.items.shipWreck.scene.children[0]
    this.setScale(shipWreck)
    shipWreck.rotateY(Math.PI / 1.5)
    shipWreck.position.set(-75, 0.6, -50)
    this.container.add(shipWreck)
  }

  /**
   * Set Tower
   * 
   * Sets a tower in the upper left quadrant.
   */
  setTower()
  {
    const tower = this.resources.items.tower.scene.children[0]
    this.setScale(tower)
    tower.position.set(-75, 0.6, 50)
    this.container.add(tower)
  }

  /**
   * Set Rock Formations
   * 
   * Sets rock formations around the map to add more scenery
   */
  setRockFormations()
  {
    const items = this.resources.items
    const formations = 
    [
      items.formationLargeStone.scene,
      items.formationLargeRock.scene,
      items.formationStone.scene,
      items.formationRock.scene,
    ]

    this.setScales(formations)

    for (let i = 0; i < 10; i++)
    {
      for (let k = 0; k < 4; k++)
      {
        const formation = new THREE.Object3D()
        formation.copy(formations[k])
        formation.position.x += Math.random() * 100 * (Math.random() > 0.5? -1 : 1)
        formation.position.z += Math.random() * 55 * (Math.random() > 0.5? -1 : 1)
        formation.position.y = 0.6
        this.container.add(formation)
      }
    }

  }

  /**
   * Set Grass Tufts
   * 
   * Adapted from threex.grass. Creates tufts of grass randomly on the map.
   */
  setGrassTufts()
  {
    // create the initial geometry
    const height = 1
    const width = 2
    const geometry = new THREE.PlaneGeometry(width, height)
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, height / 2, 0));


    // Tweak the normal for better lighting
    // - normals from http://http.developer.nvidia.com/GPUGems/gpugems_ch07.html
    // - normals inspired from http://simonschreibt.de/gat/airborn-trees/
    geometry.faces.forEach(function(face) {
      face.vertexNormals.forEach(function(normal) {
        normal.set(0,1,0).normalize()
      })
    })

    // Randomly position tufts over the map
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < 10000; i++)
    {
      const x = Math.random() * 150 * (Math.random() > 0.5? -1 : 1)
      const z = Math.random() * 100 * (Math.random() > 0.5? -1 : 1)
      const y = 0.6
      positions.push(new THREE.Vector3(x, y, z))
    }

    const texture  = this.resources.textures.grassTuft

    const material  = new THREE.MeshPhongMaterial(
    {
      map    : texture,
      color    : 'grey',
      emissive  : 'darkgreen',
      alphaTest  : 0.7,
    })
  
    // create each tuft and merge their geometry for performance
    const mergedGeometry = new THREE.Geometry()
    for (let i = 0; i < positions.length; i++)
    {
      const position = positions[i]      
      const baseAngle  = Math.PI * 2 * Math.random()

      const nPlanes = 2

      for (let j = 0; j < nPlanes; j++)
      {
        let angle  = baseAngle + j * Math.PI/ nPlanes

        // First plane
        const grassPlane = new THREE.Mesh(geometry)
        grassPlane.rotateY(angle)
        grassPlane.position.copy(position)
        grassPlane.updateMatrix()
        mergedGeometry.merge(
          grassPlane.geometry as THREE.Geometry, 
          grassPlane.matrix)

        // The other side of the plane
        // - impossible to use side : THREE.BothSide as 
        //   it would mess up the normals
        const grassOtherPlane = new THREE.Mesh(geometry)
        grassOtherPlane.rotateY(angle + Math.PI)
        grassOtherPlane.position.copy(position)
        mergedGeometry.merge(
          grassOtherPlane.geometry as THREE.Geometry, 
          grassOtherPlane.matrix)
      }
    }

    // create the mesh
    const mesh = new THREE.Mesh(mergedGeometry, material)
    this.container.add(mesh)
  }

  // Helpers 

  /**
   * Sets common scale to object
   * 
   * @param object object to be scaled
   */
  setScale(object: THREE.Object3D, scale: number = 4)
  {
    object.scale.set(scale, scale, scale)
  }
  setScales(objects: THREE.Object3D[], scale: number = 4)
  {
    objects.forEach(o => this.setScale(o, scale))
  }
}