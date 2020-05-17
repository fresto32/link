/* eslint-disable no-undef */
import Application from './typescript/Application';
import ApplicationSettings from './typescript/Settings/Application';

const settings: ApplicationSettings = {
  config: {debug: true, showBoundingBoxes: false, touch: false},
};

new Application($('#c')[0] as HTMLCanvasElement, settings);
