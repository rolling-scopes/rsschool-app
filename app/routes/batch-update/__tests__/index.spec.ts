// import { App } from '../../../';
//
import * as request from 'supertest';

// jest.setTimeout(10000);
// let server: any = null;
// let app: any = null;
// let agent: any = null;

// beforeEach(async () => {
//     app = new App();
//     server = app.start();
//     await app.connect();
// });
// afterEach(async () => {
//     await app.disconnect();
//     server.close();
// });
test.skip('should parse request data correctly', async done => {
    const data = {
        courseId: 'course',
        headers: JSON.stringify({ studentId: 'GitHub Студента' }),
        taskId: 'task',
    };
    const {
        headers: { ['set-cookie']: cookie },
    } = await request(server).get('/auth/github');
    await done();

    // const response = await request(server)
    //     .patch('/batch-update/save-table')
    //     .set('Content-Type', 'application/json')
    //     .set('Accept', 'application/json')
    //     .set('Cookie', cookie)
    //     .send(JSON.stringify(data));
    // console.log(response.status);
});
