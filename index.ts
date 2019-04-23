import 'reflect-metadata'; // for typeorm
import { App } from './src';

const app = new App();
app.start();
// app.connect();
app.pgConnect();
