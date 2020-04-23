import * as THREE from 'three';

export default class Signpost {
  /** Container */
  container: THREE.Object3D;
  /** Text Texture */
  textTexture!: THREE.CanvasTexture;
  /** Text to write on sign post */
  text: string;
  /** Background Mesh */
  background!: THREE.Mesh;
  /** Border Mesh */
  border!: THREE.Mesh;
  /** Signpost Mesh */
  signpost!: THREE.Mesh;

  constructor(_params: {text: string}) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = true;

    // Params
    this.text = _params.text;

    // Setting up scenegraph
    this.setText();
    this.setBackground();
    this.setSignpost();
  }

  /**
   * Set Text
   */
  setText() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) throw console.error('Could not find context.');

    const textHeight = 100;
    const metrics = context.measureText(this.text);
    const textWidth = metrics.width;

    canvas.width = 2400;
    canvas.height = 120;

    context.fillStyle = '#FFF';

    context.font = 'normal ' + textHeight + 'px Arial';

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';
    context.fillText(this.text, canvas.width / 2, canvas.height / 2);

    console.log(textWidth);
    console.log(textHeight);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    this.textTexture = texture;
  }

  /**
   * Set Background
   *
   * The background for the prompt text is a single sided plane.
   */
  setBackground() {
    const material = new THREE.MeshBasicMaterial({map: this.textTexture});
    const geometry = new THREE.BoxBufferGeometry(7, 1, 1, 10, 10);
    this.background = new THREE.Mesh(geometry, material);
    this.background.position.y = 4.5;
    this.container.add(this.background);
  }

  /**
   * Set Signpost
   *
   * The sign post is a brown box
   */
  setSignpost() {
    const material = new THREE.MeshBasicMaterial({color: '#964B00'});
    const geometry = new THREE.BoxBufferGeometry(1, 4, 1, 10, 10);
    this.signpost = new THREE.Mesh(geometry, material);
    this.signpost.position.y = 2;
    this.container.add(this.signpost);
  }
}
