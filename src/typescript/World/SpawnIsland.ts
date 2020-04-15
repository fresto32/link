import * as THREE from 'three'

export default class SpawnIsland
{
  /** Container */
  container: THREE.Object3D
  /** Background Mesh */
  background: THREE.Mesh
  /** Border Mesh */
  border: THREE.Mesh

  constructor()
  {
    // Container
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = true

    // Setting up scenegraph
    this.setBackground()
    this.setBorder()
    this.setPyramids()
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
    this.background.position.z = 0.5
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
    this.container.add(this.border)
  }

  /**
   * Set Pyramids
   * 
   * Some landmark additions to flesh out the concept
   */
  setPyramids()
  {
    const geometry = new THREE.ConeGeometry(50, 90, 5, 5, true);
    const material = new THREE.MeshPhongMaterial({color: 0xffff00});
    const cones = 
    [
      new THREE.Mesh(geometry, material),
      new THREE.Mesh(geometry, material),
      new THREE.Mesh(geometry, material),
      new THREE.Mesh(geometry, material)
    ]
    cones.forEach(c => c.rotateX(Math.PI / 2))
    cones[0].position.set(75,   50, 0.6)
    cones[1].position.set(75,  -50, 0.6)
    cones[2].position.set(-75,  50, 0.6)
    cones[3].position.set(-75, -50, 0.6)

    cones.forEach(c => this.container.add(c))
  }
}