import { render, screen } from '@testing-library/react';
import { TaskSolutionResultRole } from 'services/course';
import { Username } from './Username';

const mockAuthor = {
  githubId: 'test-github-1234',
  discord: null,
};

describe('Username', () => {
  test.each`
    reviewNumber | author        | role                               | areContactsVisible | expectedUsername
    ${0}         | ${null}       | ${TaskSolutionResultRole.Reviewer} | ${true}            | ${'Reviewer 1'}
    ${1}         | ${null}       | ${TaskSolutionResultRole.Reviewer} | ${false}           | ${'Reviewer 2'}
    ${2}         | ${mockAuthor} | ${TaskSolutionResultRole.Reviewer} | ${true}            | ${'test-github-1234'}
    ${3}         | ${mockAuthor} | ${TaskSolutionResultRole.Reviewer} | ${false}           | ${'Reviewer 4 (hidden)'}
    ${4}         | ${null}       | ${TaskSolutionResultRole.Student}  | ${true}            | ${'Student'}
    ${5}         | ${null}       | ${TaskSolutionResultRole.Student}  | ${false}           | ${'Student'}
    ${6}         | ${mockAuthor} | ${TaskSolutionResultRole.Student}  | ${true}            | ${'test-github-1234'}
    ${7}         | ${mockAuthor} | ${TaskSolutionResultRole.Student}  | ${false}           | ${'Student (hidden)'}
  `(
    `should display "$expectedUsername" if:
    "reviewNumber" = "$reviewNumber", "author" = "$author", "role" = "$role", "areContactsVisible" = "$areContactsVisible"`,
    ({ reviewNumber, author, role, areContactsVisible, expectedUsername }) => {
      render(
        <Username reviewNumber={reviewNumber} author={author} role={role} areContactsVisible={areContactsVisible} />,
      );

      const username = screen.getByText(expectedUsername);

      expect(username).toBeInTheDocument();
    },
  );
});
