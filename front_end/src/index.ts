/* eslint-disable no-undef */
import Application from './typescript/Application';
import Settings from './typescript/Settings';

const canvas = $('#c')[0] as HTMLCanvasElement;
const settings = new Settings();

new Application(canvas, settings);
