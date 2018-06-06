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
        it('should error on the default route with a 404', async () => {
            const response = await request(server).get(`/`);
            expect(response.status).toBe(404);
        });
    });

    describe(`GET /health`, () => {
        it('should healthcheck', async () => {
            const response = await request(server).get(`/health`);
            expect(response.status).toBe(200);
        });
    });
});
