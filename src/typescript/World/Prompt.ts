import * as THREE from 'three'

export default class Prompt
{
  /** Container */
  container: THREE.Object3D
  /** Text Texture */
  textTexture: THREE.CanvasTexture
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
    this.setText()
    this.setBackground()
    this.setBorder()
  }

  /**
   * Set Text
   */
  setText()
  {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const text = 'What is an example of an O(n) sorting algorithm?'
    const textHeight = 100
    const metrics = context.measureText(text)
    const textWidth = metrics.width
    
    canvas.width = 2400
    canvas.height = 120

    context.fillStyle = '#FFF'

    context.font = 'normal ' + textHeight + 'px Arial' 

    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#000000'
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    console.log(textWidth)
    console.log(textHeight)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    this.textTexture = texture
  }

  /**
   * Set Background
   * 
   * The background for the prompt text is a single sided plane.
   */
  setBackground()
  {
    const backgroundMaterial = new THREE.MeshBasicMaterial({map: this.textTexture})
    const backgroundGeometry = new THREE.PlaneBufferGeometry(300, 25, 10, 10);
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
    const borderMaterial = new THREE.MeshBasicMaterial({color: black})
    const borderGeometry = new THREE.PlaneBufferGeometry(302, 27, 10, 10);
    this.border = new THREE.Mesh(borderGeometry, borderMaterial)
    this.container.add(this.border)
  }
}