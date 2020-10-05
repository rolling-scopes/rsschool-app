import 'reflect-metadata'; // for typeorm
import { App } from './src';

const app = new App();
app
  .pgConnect()
  .then(() => app.start())
  .then(() => app.startBackgroundJobs())
  .catch(e => console.error(e));
