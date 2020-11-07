import {OK} from 'http-status-codes';
import Application from './typescript/Application';
import Settings from './typescript/Settings';

const canvas = $('#c')[0] as HTMLCanvasElement;

fetch('http://localhost:8010/proxy/api/next-card').then(
  response => {
    if (response.status === OK) {
      response.json().then(
        userCard => {
          new Application(canvas, userCard.card);
        },
        error => {
          console.log(error);
        }
      );
    } else {
      console.error(response.status);
      console.error(response.statusText);
    }
  },
  () => {
    const settings = new Settings();
    new Application(canvas, settings);
  }
);
