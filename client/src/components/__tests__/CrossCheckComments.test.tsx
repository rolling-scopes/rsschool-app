import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { CrossCheckComments } from '../CrossCheckComments';

describe('CrossCheckComments', () => {
  describe('Should render correctly', () => {
    const anonComment = {
      comment: 'Awful job, you better quit programming and learn to cross stitch.',
      score: 5,
      author: null,
    };

    const signedComment = {
      comment: 'Great job, you better quit cross stitching and start programming.',
      score: 100,
      author: {
        name: 'Linus Torvalds',
        githubId: 'torvalds',
      },
    };

    const emptyComments: any = [];

    const anonComments = [anonComment, anonComment, anonComment];

    const signedComments = [signedComment, signedComment, signedComment];

    const mixedComments = [anonComment, anonComment, signedComment, signedComment, anonComment];

    it("if there's no comments", () => {
      const output = shallow(<CrossCheckComments comments={emptyComments} />);
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if there are anonymous comments', () => {
      const output = shallow(<CrossCheckComments comments={anonComments} />);
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if there are signed comments', () => {
      const output = shallow(<CrossCheckComments comments={signedComments} />);
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if there are both types of comments', () => {
      const output = shallow(<CrossCheckComments comments={mixedComments} />);
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });
});
