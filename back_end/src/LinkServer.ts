import {Server} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as controllers from './controllers';

class LinkServer extends Server {
  private readonly SERVER_START_MSG = 'Link server started on port: ';
  private readonly DEV_MSG =
    'Express Server is running in development mode. ' +
    'No front-end content is being served.';

  constructor() {
    super(true);

    this.setupMiddleware();
    this.setupControllers();
    this.setupViews();
  }

  private setupMiddleware(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  private setupControllers(): void {
    super.addControllers(this.allControllerInstances);
  }

  // TODO: Qualify the any array.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private allControllerInstances(): any[] {
    const controllerInstances = [];
    for (const name in controllers) {
      // TODO: Check if name is in the qualified array.
      // eslint-disable-next-line no-prototype-builtins
      if (controllers.hasOwnProperty(name)) {
        // TODO: Qualify the any array.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Controller = (controllers as any)[name];
        controllerInstances.push(new Controller());
      }
    }

    return controllerInstances;
  }

  private setupViews(): void {
    if (this.inProduction()) this.serveFrontEnd();
    else this.serveDevelopmentMessageOnly();
  }

  private inProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private serveFrontEnd(): void {
    const frontEndDir = this.getFrontEndDirectory();

    this.app.set('views', frontEndDir);
    this.app.use(express.static(frontEndDir));

    this.app.get('*', (req, res) => {
      res.sendFile('index.html', {root: frontEndDir});
    });
  }

  private getFrontEndDirectory(): string {
    return path.join(__dirname, 'public/app/');
  }

  private serveDevelopmentMessageOnly(): void {
    this.app.get('*', (req, res) => res.send(this.DEV_MSG));
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      Logger.Imp(this.SERVER_START_MSG + port);
    });
  }
}

export default LinkServer;
