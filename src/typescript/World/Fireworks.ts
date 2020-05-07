import * as THREE from 'three';
import Sizes from '../Utils/Sizes';
import Time from '../Utils/Time';

export default class Firework {
  /** Container */
  container: THREE.Object3D;
  /** Sizes  */
  readonly sizes: Sizes;
  /** Time */
  readonly time: Time;

  // Fireworks Functionality
  /** Are we currently animating? */
  isAnimating: boolean;
  /** Destinations of the particles of the firework */
  destinations: THREE.Vector3[];
  /** Colors of each particle in the firework */
  colors: THREE.Color[];
  /** Firework geometry */
  geometry: THREE.Geometry | null;
  /** Firework Material */
  material: THREE.PointsMaterial;
  /** Points of the particles */
  particlePoints: THREE.Points | null;
  /** Firework Starting Position */
  startingPosition: THREE.Vector3;
  /** Trajectory Height */
  trajectoryHeight: number;
  /** Particle Spread */
  particleSpread: number;
  /** Number of Particles */
  numberOfParticles: number;

  constructor(_params: {
    sizes: Sizes;
    time: Time;
    startingPosition: THREE.Vector3;
    trajectoryHeight: number;
    particleSpread: number;
    numberOfParticles: number;
  }) {
    this.container = new THREE.Object3D();
    this.isAnimating = false;
    this.destinations = [];
    this.colors = [];
    this.geometry = null;
    this.particlePoints = null;

    // Parameters
    this.sizes = _params.sizes;
    this.time = _params.time;
    this.startingPosition = _params.startingPosition;
    this.trajectoryHeight = _params.trajectoryHeight;
    this.particleSpread = _params.particleSpread;
    this.numberOfParticles = _params.numberOfParticles;

    this.material = new THREE.PointsMaterial({
      size: 1,
      color: 0xffffff,
      opacity: 1,
      vertexColors: true,
      transparent: true,
      depthTest: false,
    });
  }

  /**
   * Reset
   */
  reset() {
    if (this.particlePoints !== null)
      this.container.remove(this.particlePoints);
    this.destinations = [];
    this.colors = [];
    this.geometry = null;
    this.particlePoints = null;
  }

  /**
   * Launch Firework
   */
  launch() {
    const x = this.startingPosition.x;
    const y = this.startingPosition.y;
    const z = this.startingPosition.z;

    // Setting trajectory start and end points...
    const from = new THREE.Vector3(x, y, z);
    const to = new THREE.Vector3(x, y + this.trajectoryHeight, z);

    // Randomizing particle colors...
    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.8 + 0.1, 1, 0.9);
    this.colors.push(color);

    // Creating THREE objects...
    this.geometry = new THREE.Geometry();
    this.particlePoints = new THREE.Points(this.geometry, this.material);

    this.geometry.colors = this.colors;
    this.geometry.vertices.push(from);
    this.destinations.push(to);
    this.colors.push(color);
    this.container.add(this.particlePoints);

    this.isAnimating = true;

    this.time.on('tick', () => {
      if (this.isAnimating) this.update();
    });
  }

  /**
   * Explode
   *
   * @param startingPosition THe starting position from which the firework is
   * exploded.
   */
  explode(startingPosition: THREE.Vector3) {
    if (this.particlePoints !== null)
      this.container.remove(this.particlePoints);
    this.destinations = [];
    this.colors = [];
    this.geometry = new THREE.Geometry();
    this.particlePoints = new THREE.Points(this.geometry, this.material);

    // Build each particle that results from the explosion...
    for (let i = 0; i < this.numberOfParticles; i++) {
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.8 + 0.1, 1, 0.9);
      this.colors.push(color);

      const from = new THREE.Vector3(
        startingPosition.x,
        startingPosition.y,
        startingPosition.z
      );

      // TODO: Consider making the 'to' vector a spherical rather than cubic
      //       bounding box. The equation for a sphere is:
      //          r ^ 2 = (x - a) ^ 2 + (y - b) ^ 2 + (z - c) ^ 2
      //       where (a, b, c) is the center of the sphere and r is the radius.

      const to = new THREE.Vector3(
        startingPosition.x -
          this.particleSpread / 2 +
          Math.random() * this.particleSpread,
        startingPosition.y -
          this.particleSpread / 2 +
          Math.random() * this.particleSpread,
        startingPosition.z -
          this.particleSpread / 2 +
          Math.random() * this.particleSpread
      );
      this.geometry.vertices.push(from);
      this.destinations.push(to);
    }
    this.geometry.colors = this.colors;
    this.container.add(this.particlePoints);
  }

  /**
   * Update
   *
   * Rendering function.
   */
  update() {
    // Only if objects exist...
    if (this.particlePoints && this.geometry) {
      const total = this.geometry.vertices.length;

      // Lerp particle positions (pushing the point along the line made by
      // its current position and its destination)...
      for (let i = 0; i < total; i++) {
        this.geometry.vertices[i].x +=
          (this.destinations[i].x - this.geometry.vertices[i].x) / 20;
        this.geometry.vertices[i].y +=
          (this.destinations[i].y - this.geometry.vertices[i].y) / 20;
        this.geometry.vertices[i].z +=
          (this.destinations[i].z - this.geometry.vertices[i].z) / 20;
        this.geometry.verticesNeedUpdate = true;
      }

      // If we only have the launching particle...
      if (total === 1) {
        // Explode it, if it's reached its destination...
        if (
          Math.ceil(this.geometry.vertices[0].y) >
          this.destinations[0].y - 20
        ) {
          this.explode(this.geometry.vertices[0]);
          return;
        }
      }

      // If we've exploded, fade out the particles...
      if (total > 1) this.material.opacity -= 0.015;

      // Reset animation...
      if (this.material.opacity <= 0) {
        this.reset();
        this.isAnimating = false;
        return;
      }
    }
  }
}
