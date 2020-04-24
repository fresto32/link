import * as THREE from 'three';

export default class Signpost {
  /** Container */
  container: THREE.Object3D;
  /** Text Texture */
  promptTexture!: THREE.CanvasTexture;
  /** Text to write to the signage*/
  text: string;
  /** Picture to write to the signage */
  picture: THREE.Texture | null;
  /** Background Mesh */
  background!: THREE.Mesh;
  /** Border Mesh */
  border!: THREE.Mesh;
  /** Signpost Mesh */
  signpost!: THREE.Mesh;

  // Signpost properties
  /** Distance between each pole */
  distanceBetweenPoles!: number;
  /** Height of each pole */
  poleHeight!: number;
  /** Radius of each pole */
  poleRadius!: number;
  /** Height of each plank */
  plankHeight!: number;
  /** Width of each plank */
  plankWidth!: number;
  /** Plank depth */
  plankDepth!: number;
  /** Offset of plank from pole outter edge */
  plankEdgeOffset!: number;
  /** Maximum Y position of the planks */
  plankMaxHeight!: number;
  /** Minimum Y position of the planks */
  plankMinHeight!: number;
  /** Spacing between each plank */
  plankSpacing!: number;
  /** Number of equivalent lines of prompt (this includes vertical space of text
   * and picture) */
  numberOfEquivalentTextLines!: number;

  // Materials
  /** Material of the planks which the signage is posted to */
  plankMaterial!: THREE.MeshPhongMaterial;
  /** Material of each of the two poles */
  poleMaterial!: THREE.MeshPhongMaterial;

  constructor(_params: {text: string; picture: THREE.Texture | null}) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = true;

    // Params
    this.text = _params.text;
    this.picture = _params.picture;

    // Setting up scenegraph
    this.setPromptTexture();
    this.setGeometricProperties();
    this.setPoles();
    this.setPlanks();
    this.setSignagePlane();
  }

  /**
   * Set Prompt Texture
   *
   * Generates the prompt texture to be printed on the signage plane.
   *
   * This depends on if a picture is added as a resource and on the length of
   * the prompt text.
   */
  setPromptTexture() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) throw console.error('Could not find context.');

    // Split lines at 46 characters...
    const lines = splitLines(this.text, 46);
    this.numberOfEquivalentTextLines = lines.length;

    const textHeight = 100;
    const horizontalPadding = textHeight * 2;

    let imageDimensions = {
      height: 0,
      width: 0,
      horizontalPadding: horizontalPadding,
    };

    canvas.width = 2400;

    if (this.picture !== null) {
      imageDimensions = ImageDimensionsInCanvas(
        context,
        canvas,
        textHeight * 8,
        this.picture.image,
        textHeight * 2,
        textHeight * 2
      );
    }

    canvas.height = 100 + textHeight * lines.length + imageDimensions.height;

    context.font = 'normal ' + textHeight + 'px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';

    lines.forEach((line, i) => {
      context.fillText(line, horizontalPadding, textHeight + i * textHeight);
    });

    if (this.picture !== null) {
      context.drawImage(
        this.picture.image,
        imageDimensions.horizontalPadding,
        textHeight + lines.length * textHeight,
        imageDimensions.width,
        imageDimensions.height
      );
      this.numberOfEquivalentTextLines +=
        canvas.height / textHeight - this.numberOfEquivalentTextLines;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    this.promptTexture = texture;
  }

  /**
   * Set Geometric Properties
   *
   * Sets all the signpost sizing members sizes and distances.
   */
  setGeometricProperties() {
    // Pole properties...
    this.poleRadius = 0.5;
    this.poleHeight = 2.5 + this.numberOfEquivalentTextLines * 2;

    this.distanceBetweenPoles = 8;

    // Plank properties...
    this.plankHeight = this.poleRadius;
    this.plankEdgeOffset = this.poleRadius * 1.5;
    this.plankWidth =
      this.plankEdgeOffset + this.distanceBetweenPoles + this.poleRadius * 2;
    this.plankDepth = this.poleRadius / 2;

    this.plankMaxHeight =
      this.poleHeight - this.plankEdgeOffset - this.plankHeight / 2;
    this.plankMinHeight = this.poleHeight / 3;

    this.plankSpacing = 0.05;
  }

  /**
   * Set Poles
   *
   * The two poles along either side of the signage.
   */
  setPoles() {
    this.poleMaterial = new THREE.MeshPhongMaterial({color: 'brown'});
    const tipHeight = 1.0;
    const radialSegments = 15;
    const heightSegments = 1;
    const openEnded = true;
    const thetaStart = Math.PI * 0.44;
    const thetaLength = Math.PI * 2.0;

    const tipGeometry = new THREE.CylinderBufferGeometry(
      /* Radius Top = */ 0, // Thus, tip is completely enclosed
      this.poleRadius,
      tipHeight,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength
    );

    const poleGeometry = new THREE.CylinderBufferGeometry(
      this.poleRadius,
      this.poleRadius,
      this.poleHeight,
      radialSegments,
      heightSegments,
      openEnded
    );

    // Adding poles...
    const leftPole = new THREE.Mesh(poleGeometry, this.poleMaterial);
    const rightPole = new THREE.Mesh(poleGeometry, this.poleMaterial);

    leftPole.position.x = -(this.distanceBetweenPoles / 2);
    rightPole.position.x = this.distanceBetweenPoles / 2;

    leftPole.position.y = this.poleHeight / 2;
    rightPole.position.y = this.poleHeight / 2;

    this.container.add(leftPole);
    this.container.add(rightPole);

    // Adding pole tips...
    const leftTip = new THREE.Mesh(tipGeometry, this.poleMaterial);
    const rightTip = new THREE.Mesh(tipGeometry, this.poleMaterial);

    leftTip.position.x = -(this.distanceBetweenPoles / 2);
    rightTip.position.x = this.distanceBetweenPoles / 2;

    leftTip.position.y = this.poleHeight + tipHeight / 2;
    rightTip.position.y = this.poleHeight + tipHeight / 2;

    this.container.add(leftTip);
    this.container.add(rightTip);
  }

  /**
   * Set Planks
   *
   * Sets the planks that are attached to the poles.
   */
  setPlanks() {
    this.plankMaterial = new THREE.MeshPhongMaterial({color: 'white'});

    const plankGeometry = new THREE.BoxBufferGeometry(
      this.plankWidth,
      this.plankHeight,
      this.plankDepth
    );

    for (
      let i = this.plankMaxHeight;
      i > this.plankMinHeight;
      i -= this.plankHeight + this.plankSpacing
    ) {
      const plank = new THREE.Mesh(plankGeometry, this.plankMaterial);
      plank.position.z = this.poleRadius;
      plank.position.y = i;
      this.container.add(plank);
    }
  }

  /**
   * Sets the Signage Text
   *
   * The text is placed on a white plane that is attached to the planks.
   */
  setSignagePlane() {
    const material = new THREE.MeshBasicMaterial({map: this.promptTexture});

    const geometry = new THREE.PlaneBufferGeometry(
      this.plankWidth! * (5 / 6),
      this.plankHeight * 2.3 * this.numberOfEquivalentTextLines
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y =
      (this.plankMaxHeight - this.plankMinHeight) / 2 + this.plankMinHeight;
    mesh.position.z = this.poleRadius + this.plankDepth;

    this.container.add(mesh);
  }
}

/**
 * Splits text into a string array of lines. Each line is of length less than or
 * equal to maxLineLength, where the ending of the line always ends on the
 * completion of some word. Thus, no words are cut between one line and another.
 * @param text The string to be split into lines.
 * @param maxLineLength The maximum number of characters per line.
 */
function splitLines(text: string, maxLineLength = 46): string[] {
  const lines: string[] = [];

  while (text.length > maxLineLength) {
    // Get maximum line length...
    let proposedLine = text.substr(0, maxLineLength);
    let i = proposedLine.length;

    // Keep pruning from maximum line length until a space is found...
    if (proposedLine.slice(-1) !== ' ') {
      while (proposedLine[i - 1] !== ' ')
        proposedLine = proposedLine.substr(0, i--);
    }

    // Return the line minus the space character...
    lines.push(text.substr(0, i - 1));

    // Remove the pushed line from text...
    text = text.substr(i - 1);
  }

  // If there's any text leftover, add it...
  if (text.length > 0) lines.push(text);

  return lines;
}
/**
 * Calculates the dimensions of an image if it were placed in context given
 * maximum canvas height and vertical and horizontal padding.
 *
 * @param context Canvas rendering context.
 * @param canvas The Canvas of the context.
 * @param canvasMaxHeight The maxmimum allowable canvas height.
 * @param image The image which dimensions will be calculated for.
 * @param verticalPadding The amount of padding from the top of the canvas
 * to the image.
 * @param horizontalPadding The amount of padding on either horizontal side of
 * the image.
 */
function ImageDimensionsInCanvas(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  canvasMaxHeight: number,
  image: CanvasImageSource,
  verticalPadding: number,
  horizontalPadding: number
) {
  if (
    image.height instanceof SVGAnimatedLength ||
    image.width instanceof SVGAnimatedLength
  ) {
    throw console.error('SVGAnimatedLength sent to PlaceImageInCanvas(...).');
  }

  // Adjust image width and height to fill available horizontal space...
  const imageAspectRatio = image.height / image.width;
  let proposedImageWidth = canvas.width - horizontalPadding * 2;
  let proposedImageHeight = canvas.width * imageAspectRatio;

  if (proposedImageHeight > canvasMaxHeight - verticalPadding) {
    // Adjust image width and height to fill available vertical space...
    proposedImageHeight = canvasMaxHeight - verticalPadding;
    proposedImageWidth = canvas.width * imageAspectRatio;
    horizontalPadding = (canvas.width - proposedImageWidth) / 2;
  }

  return {
    height: proposedImageHeight,
    width: proposedImageWidth,
    horizontalPadding: horizontalPadding,
  };
}
