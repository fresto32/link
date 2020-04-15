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
}