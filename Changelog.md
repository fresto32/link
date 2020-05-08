# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0]

### Added

- Avatar movement has been overhauled. 
  - The avatar now moves relative to its current orientation.
  - Avatar can also strafe.
- The camera's [azimuth angle](https://en.wikipedia.org/wiki/Azimuth) is now locked onto the avatar's orientation.
- Object collision has been added.
  - When the avatar collides with a collidable object, the avatar's moves back.
  - Object clusters now generate bounding boxes for each object in the cluster for collision detection.
- ```Objects``` class now universally handles adding objects to containers.

## [0.1.0]

### Added

- Undulating terrain.
- Signposts include pictures and prompt text.
- Landmarks at each signpost.
- Shrubbery across the terrain (rocks and grass tufts).
- Signpost interactions.
  - Signposts light up when avatar is in their vicinity.
  - Signposts light up green / red depending on whether they are the right answer or not.
  - The correct signpost emits fireworks on correct guess.
- Google's Typescript Style Guide enforcer.
  - Use ``` npx gts check ``` to run the check before commits.
  - Or, even better, integrate it into VS Code using Prettier.
- Avatar movement via:
  - wasd or arrow keys
  - left joystick control when on a touch device
- Camera control via:
  - mouse
  - right joystick control when on a touch device
- Camera is locked onto avatar.
- Map fencing and borders.
- Skybox.
- Geometry merging performance improvements: see: ```GenerateObjectCluster.ts```.
- Arbitrarily sized buildings.
  - Buildings can be constructed with an arbitrary number of height, depth, and width sections.
  - Buildings upper floors are hidden on avatar entry.
