import * as chai from 'chai';

import { App } from '../../app';

chai.use(require('chai-http')); //tslint:disable-line

let server: any;

describe('routes', () => {
    before(() => {
        const app = new App();
        server = app.start();
    });

    after(() => server.close());

    describe(`GET /`, () => {
        it('should error on the default route with a 404', done => {
            chai
                .request(server)
                .get(`/`)
                .end((err, res) => {
                    chai.should().exist(err);
                    res.status.should.eql(404);
                    done();
                });
        });
    });

    describe(`GET /health`, () => {
        it('should healthcheck', done => {
            chai
                .request(server)
                .get(`/health`)
                .end((err, res) => {
                    isOk(err, res, 200, 'text/plain');
                    done();
                });
        });
    });
});

const isOk = (err: any, res: any, status: number = 200, type: string = 'application/json') => {
    chai.should().not.exist(err);
    res.status.should.eql(status);
    res.type.should.eql(type);
};
