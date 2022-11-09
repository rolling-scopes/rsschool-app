import { render, screen } from '@testing-library/react';
import { CrossCheckMessageAuthorRole } from 'services/course';
import { Username } from '.';

const mockAuthor = {
  githubId: 'test-github-1234',
  discord: null,
};

describe('Username', () => {
  test.each`
    reviewNumber | author        | role                                    | areContactsVisible | expectedUsername
    ${0}         | ${null}       | ${CrossCheckMessageAuthorRole.Reviewer} | ${true}            | ${'Reviewer 1'}
    ${1}         | ${null}       | ${CrossCheckMessageAuthorRole.Reviewer} | ${false}           | ${'Reviewer 2'}
    ${2}         | ${mockAuthor} | ${CrossCheckMessageAuthorRole.Reviewer} | ${true}            | ${'test-github-1234'}
    ${3}         | ${mockAuthor} | ${CrossCheckMessageAuthorRole.Reviewer} | ${false}           | ${'Reviewer 4 (hidden)'}
    ${4}         | ${null}       | ${CrossCheckMessageAuthorRole.Student}  | ${true}            | ${'Student'}
    ${5}         | ${null}       | ${CrossCheckMessageAuthorRole.Student}  | ${false}           | ${'Student'}
    ${6}         | ${mockAuthor} | ${CrossCheckMessageAuthorRole.Student}  | ${true}            | ${'test-github-1234'}
    ${7}         | ${mockAuthor} | ${CrossCheckMessageAuthorRole.Student}  | ${false}           | ${'Student (hidden)'}
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
