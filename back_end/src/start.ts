import {Fixtures} from './database/Fixtures';
import LinkServer from './LinkServer';

startServer();

async function startServer(): Promise<void> {
  const server = new LinkServer();
  server.start(process.env.NODE_ENV === 'development' ? 3001 : 8081);
  await Fixtures.add();
}
