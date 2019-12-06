import 'reflect-metadata'; // for typeorm
import { App, createDefaultLogger } from './src';

createDefaultLogger().then(logger => {
  const app = new App(logger);
  app.start();
  app
    .pgConnect()
    .then(() => app.startBackgroundJobs())
    .catch(e => console.error(e));
});
