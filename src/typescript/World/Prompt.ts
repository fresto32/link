import * as THREE from 'three'
import PromptMaterial from '../Materials/Prompt'

export default class Prompt
{
  /** Container */
  container: THREE.Object3D
  /** Geometry */
  geometry: THREE.PlaneGeometry
  /** Material */
  material: THREE.Material
  /** Mesh */
  mesh: THREE.Mesh

  constructor()
  {
    // Container
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = false

    // Geometry
    this.geometry = new THREE.PlaneGeometry(10, 3, 10, 10)

    // Material
    this.material = PromptMaterial()

    // Mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.matrixAutoUpdate = false
    this.mesh.updateMatrix()
    this.container.add(this.mesh)
  }
}