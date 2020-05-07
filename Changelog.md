# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
