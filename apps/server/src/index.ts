import 'reflect-metadata'; // for typeorm
import { App } from './app';

const app = new App();
app
  .pgConnect()
  .then(() => app.start(true))
  .then(() => app.startBackgroundJobs())
  .catch(e => console.error(e));
