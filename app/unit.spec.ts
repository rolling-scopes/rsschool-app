import { expect } from 'chai';

describe('my first test', () => {
    it('am i exist', done => {
        expect('me').to.exist;
        done();
    });
});
