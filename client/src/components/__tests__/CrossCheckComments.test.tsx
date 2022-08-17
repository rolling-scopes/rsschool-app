import React from 'react';
import { render } from '@testing-library/react';
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
      const output = render(<CrossCheckComments comments={emptyComments} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are anonymous comments', () => {
      const output = render(<CrossCheckComments comments={anonComments} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are signed comments', () => {
      const output = render(<CrossCheckComments comments={signedComments} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are both types of comments', () => {
      const output = render(<CrossCheckComments comments={mixedComments} />);
      expect(output.container).toMatchSnapshot();
    });
  });
});
