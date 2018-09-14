// import { BAD_REQUEST, OK } from 'http-status-codes';
// // import { connection, STATES } from 'mongoose';
// import { App } from '../../index';
// import * as getPort from 'get-port';

// import * as request from 'supertest';

// let server: any = null;
// let app: App;

// beforeAll(async () => {
//     app = new App();
//     server = app.start(7575);
//     await app.connect();
// });
// afterAll(async () => {
//     await app.disconnect();
//     server.close();
// });
it('stub', () => {
    expect(true).toEqual(true);
});

// describe('should parse request data correctly and return correspond status', async () => {
//     it('returns status 200', async () => {
//         const data = {
//             data: {
//                 assignments: [1, 2],
//             },
//         };

//         const {
//             headers: { ['set-cookie']: cookies },
//         } = await request(server).get('/auth/github');
//         const cookie = cookies
//             .join('')
//             .match(/koa:sess(.*?);/g)
//             .join('');

//         const res = await request(server)
//             .patch('/batchUpdate/saveTable')
//             .set('Content-Type', 'application/json')
//             .set('Accept', 'application/json')
//             .set('Cookie', cookie)
//             .send(JSON.stringify(data));

//         expect(res.status).toEqual(OK);
//     });

//     it('returns status 400', async () => {
//         const data = {
//             data: {},
//         };

//         const {
//             headers: { ['set-cookie']: cookies },
//         } = await request(server).get('/auth/github');
//         const cookie = cookies
//             .join('')
//             .match(/koa:sess(.*?);/g)
//             .join('');

//         const res = await request(server)
//             .patch('/batchUpdate/saveTable')
//             .set('Content-Type', 'application/json')
//             .set('Accept', 'application/json')
//             .set('Cookie', cookie)
//             .send(JSON.stringify(data));

//         expect(res.status).toEqual(BAD_REQUEST);
//     });
//     // tbd
// });
