import { App } from '../../app';

import * as request from 'supertest';

let server: any;

describe('Routes', () => {
    beforeEach(() => {
        const app = new App();
        server = app.start();
    });

    afterEach(() => {
        server.close();
    });

    describe(`GET /`, () => {
        xit('should error on the default route with a 404', async () => {
            const response = await request(server).get(`/`);
            expect(response.status).toBe(404);
        });
    });

    describe(`GET /health`, () => {
        xit('should healthcheck', async () => {
            const response = await request(server).get(`/health`);
            expect(response.status).toBe(200);
        });
    });
});
