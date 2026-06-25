import 'reflect-metadata'; // for typeorm
import { App } from './app';

const app = new App();
app.start(true);
