import {Fixtures} from './database/Fixtures';
import LinkServer from './LinkServer';

startServer();

async function startServer(): Promise<void> {
  const server = new LinkServer();
  server.start(process.env.NODE_ENV === 'development' ? 8081 : 8081);
  process.env.NODE_ENV = 'development';
  await Fixtures.add();
}
