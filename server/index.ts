import 'reflect-metadata'; // for typeorm
import { App } from './src';

const app = new App();
app.start();
app
  .pgConnect()
  .then(() => app.startBackgroundJobs())
  .catch(e => console.error(e));
