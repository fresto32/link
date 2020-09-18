import {Server} from '@overnightjs/core';
import * as bodyParser from 'body-parser';
import {Application} from 'express';

class TestServer extends Server {
  constructor() {
    super();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  public setController(controller: object): void {
    super.addControllers(controller);
  }

  public getExpressInstance(): Application {
    return this.app;
  }
}

export default TestServer;
