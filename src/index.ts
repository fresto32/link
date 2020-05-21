/* eslint-disable no-undef */
import Application from './typescript/Application';
import SettingsGenerator from './typescript/Settings';

const settings = new SettingsGenerator();

new Application($('#c')[0] as HTMLCanvasElement, settings);
