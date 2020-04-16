import * as THREE from 'three'
import Resources from '../Resources'

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
  }

  /**
   * Set Background
   * 
   * The background for the spawn island is a single sided plane.
   */
  setBackground()
  {
    const white = 0xFFFFFF
    const backgroundMaterial = new THREE.MeshPhongMaterial({color: white})
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
    const black = 0x000000
    const material = new THREE.MeshBasicMaterial({color: black})
    const geometry = new THREE.PlaneBufferGeometry(302, 202, 10, 10);
    this.border = new THREE.Mesh(geometry, material)
    this.border.rotateX(-Math.PI / 2)
    this.container.add(this.border)
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
    const palmShortModel = this.resources.items.palmDetailedShort.scene.children[0]
    const palmLongModel = this.resources.items.palmDetailedLong.scene.children[0]

    this.setScale(palmShortModel)
    this.setScale(palmLongModel)

    palmShortModel.position.set(75, 0.6, -50)
    palmLongModel.position.set(75, 0.6, -48)

    for (let i = 0; i < 60; i++) 
    {
      const palmShort = new THREE.Object3D()
      palmShort.copy(palmShortModel)
      palmShort.position.x += Math.random() * 40 * (Math.random() > 0.5? -1 : 1)
      palmShort.position.z += Math.random() * 40 * (Math.random() > 0.5? -1 : 1)

      const palmLong = new THREE.Object3D()
      palmLong.copy(palmShortModel)
      palmLong.position.x += Math.random() * 40 * (Math.random() > 0.5? -1 : 1)
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

  // Helpers 

  /**
   * Sets common scale to object
   * 
   * @param object object to be scaled
   */
  setScale(object: THREE.Object3D)
  {
    object.scale.set(4, 4, 4)
  }
  setScales(objects: THREE.Object3D[])
  {
    objects.forEach(o => this.setScale(o))
  }
}