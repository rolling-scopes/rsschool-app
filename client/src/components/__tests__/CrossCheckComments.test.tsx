import React from 'react';
import { render } from '@testing-library/react';
import { Feedback } from 'services/course';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { CrossCheckComments } from '../CrossCheckComments';
import { CrossCheckCriteriaData } from 'components/CrossCheck/CrossCheckCriteriaForm';
import { Discord } from 'api';

interface IComment {
  updatedDate: string;
  comment: string;
  criteria: CrossCheckCriteriaData[];
  score: number;
  author: {
    name: string;
    githubId: string;
    discord: Discord | null;
  } | null;
}

describe('CrossCheckComments', () => {
  describe('Should render correctly', () => {
    const anonComment: IComment = {
      updatedDate: '2022-08-30T13:35:14.866Z',
      comment: `${markdownLabel}Awful job, you better quit programming and learn to cross stitch.`,
      criteria: [
        {
          key: '1',
          max: 10,
          text: 'Add slider with random images',
          type: 'subtask',
          point: 8,
          textComment: 'Great',
        },
      ],
      score: 5,
      author: null,
    };

    const signedComment: IComment = {
      updatedDate: '2022-08-27T09:51:34.615Z',
      comment: `${markdownLabel}Great job, you better quit cross stitching and start programming.`,
      criteria: [
        {
          key: '1',
          max: 10,
          text: 'Add slider with random images',
          type: 'subtask',
          point: 8,
          textComment: 'Great',
        },
      ],
      score: 100,
      author: {
        name: 'Linus Torvalds',
        githubId: 'torvalds',
        discord: {
          id: '123456789012345678',
          username: 'LinusTorvalds',
          discriminator: '234',
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
      const { container } = render(<CrossCheckComments feedback={feedbackWithEmptyComments} maxScore={maxScore} />);
      expect(container).toMatchSnapshot();
    });
    it('if there are anonymous comments', () => {
      const { container } = render(<CrossCheckComments feedback={feedbackWithAnonComments} maxScore={maxScore} />);
      expect(container).toMatchSnapshot();
    });
    it('if there are signed comments', () => {
      const { container } = render(<CrossCheckComments feedback={feedbackWithSignedComments} maxScore={maxScore} />);
      expect(container).toMatchSnapshot();
    });
    it('if there are both types of comments', () => {
      const { container } = render(<CrossCheckComments feedback={feedbackWithMixedComments} maxScore={maxScore} />);
      expect(container).toMatchSnapshot();
    });
  });
});
