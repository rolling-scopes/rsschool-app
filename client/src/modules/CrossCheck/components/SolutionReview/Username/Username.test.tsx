import { render, screen, within } from '@testing-library/react';
import { CrossCheckMessageAuthor } from '@client/services/course';
import { Username } from '.';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';

const mockAuthor: CrossCheckMessageAuthor = {
  id: 2345,
  githubId: 'test-github-1234',
};

describe('Username', () => {
  test('displays the expected username for every role, author, and visibility combination', () => {
    const cases = [
      [0, null, CrossCheckMessageDtoRoleEnum.Reviewer, true, 'Reviewer 1'],
      [1, null, CrossCheckMessageDtoRoleEnum.Reviewer, false, 'Reviewer 2'],
      [2, mockAuthor, CrossCheckMessageDtoRoleEnum.Reviewer, true, 'test-github-1234'],
      [3, mockAuthor, CrossCheckMessageDtoRoleEnum.Reviewer, false, 'Reviewer 4 (hidden)'],
      [4, null, CrossCheckMessageDtoRoleEnum.Student, true, 'Student'],
      [5, null, CrossCheckMessageDtoRoleEnum.Student, false, 'Student'],
      [6, mockAuthor, CrossCheckMessageDtoRoleEnum.Student, true, 'test-github-1234'],
      [7, mockAuthor, CrossCheckMessageDtoRoleEnum.Student, false, 'Student (hidden)'],
    ] as const;

    render(
      <>
        {cases.map(([reviewNumber, author, role, areContactsVisible], index) => (
          <div key={reviewNumber} data-testid={`username-${index}`}>
            <Username reviewNumber={reviewNumber} author={author} role={role} areContactsVisible={areContactsVisible} />
          </div>
        ))}
      </>,
    );

    cases.forEach(([, , , , expectedUsername], index) => {
      expect(within(screen.getByTestId(`username-${index}`)).getByText(expectedUsername)).toBeInTheDocument();
    });
  });
});
