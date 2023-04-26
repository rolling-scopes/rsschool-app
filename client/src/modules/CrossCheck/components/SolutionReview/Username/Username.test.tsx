import { render, screen } from '@testing-library/react';
import { CrossCheckMessageAuthor } from 'services/course';
import { Username } from '.';
import { CrossCheckMessageDtoRoleEnum } from 'api';

const mockAuthor: CrossCheckMessageAuthor = {
  id: 2345,
  githubId: 'test-github-1234',
};

describe('Username', () => {
  test.each`
    reviewNumber | author        | role                                    | areContactsVisible | expectedUsername
    ${0}         | ${null}       | ${CrossCheckMessageDtoRoleEnum.Reviewer} | ${true}            | ${'Reviewer 1'}
    ${1}         | ${null}       | ${CrossCheckMessageDtoRoleEnum.Reviewer} | ${false}           | ${'Reviewer 2'}
    ${2}         | ${mockAuthor} | ${CrossCheckMessageDtoRoleEnum.Reviewer} | ${true}            | ${'test-github-1234'}
    ${3}         | ${mockAuthor} | ${CrossCheckMessageDtoRoleEnum.Reviewer} | ${false}           | ${'Reviewer 4 (hidden)'}
    ${4}         | ${null}       | ${CrossCheckMessageDtoRoleEnum.Student}  | ${true}            | ${'Student'}
    ${5}         | ${null}       | ${CrossCheckMessageDtoRoleEnum.Student}  | ${false}           | ${'Student'}
    ${6}         | ${mockAuthor} | ${CrossCheckMessageDtoRoleEnum.Student}  | ${true}            | ${'test-github-1234'}
    ${7}         | ${mockAuthor} | ${CrossCheckMessageDtoRoleEnum.Student}  | ${false}           | ${'Student (hidden)'}
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
