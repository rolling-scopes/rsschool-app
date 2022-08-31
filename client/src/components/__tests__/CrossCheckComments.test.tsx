import React from 'react';
import { render } from '@testing-library/react';
import { Feedback } from 'services/course';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { CrossCheckComments } from '../CrossCheckComments';

describe('CrossCheckComments', () => {
  describe('Should render correctly', () => {
    const anonComment = {
      updatedDate: '2022-08-30T13:35:14.866Z',
      comment: `${markdownLabel}Awful job, you better quit programming and learn to cross stitch.`,
      score: 5,
      author: null,
    };

    const signedComment = {
      updatedDate: '2022-08-27T09:51:34.615Z',
      comment: `${markdownLabel}Great job, you better quit cross stitching and start programming.`,
      score: 100,
      author: {
        name: 'Linus Torvalds',
        githubId: 'torvalds',
        discord: {
          id: +'123456789012345678',
          username: 'LinusTorvalds',
          discriminator: 1234,
        },
      },
    };

    const emptyComments: any = [];

    const anonComments = [anonComment, anonComment, anonComment];

    const signedComments = [signedComment, signedComment, signedComment];

    const mixedComments = [anonComment, anonComment, signedComment, signedComment, anonComment];

    const feedbackWithEmptyComments: Feedback = {
      url: 'https://rolling-scopes-school.github.io/torvalds-JSFE2021Q3/async-race/',
      comments: emptyComments,
    };

    const feedbackWithAnonComments: Feedback = {
      url: 'https://rolling-scopes-school.github.io/torvalds-JSFE2021Q3/async-race/',
      comments: anonComments,
    };

    const feedbackWithSignedComments: Feedback = {
      url: 'https://rolling-scopes-school.github.io/torvalds-JSFE2021Q3/async-race/',
      comments: signedComments,
    };

    const feedbackWithMixedComments: Feedback = {
      url: 'https://rolling-scopes-school.github.io/torvalds-JSFE2021Q3/async-race/',
      comments: mixedComments,
    };

    const maxScore = 100;

    it("if there's no comments", () => {
      const output = render(<CrossCheckComments feedback={feedbackWithEmptyComments} maxScore={maxScore} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are anonymous comments', () => {
      const output = render(<CrossCheckComments feedback={feedbackWithAnonComments} maxScore={maxScore} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are signed comments', () => {
      const output = render(<CrossCheckComments feedback={feedbackWithSignedComments} maxScore={maxScore} />);
      expect(output.container).toMatchSnapshot();
    });
    it('if there are both types of comments', () => {
      const output = render(<CrossCheckComments feedback={feedbackWithMixedComments} maxScore={maxScore} />);
      expect(output.container).toMatchSnapshot();
    });
  });
});
