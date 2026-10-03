import { render, screen } from '@testing-library/react';
import Message, { MessageProps } from './Message';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';

const messageProps: MessageProps = {
  reviewNumber: 1,
  message: {
    timestamp: '2022-03-15T00:00:00.000Z',
    content: 'Lorem ipsum',
    author: { id: 12, githubId: 'John Doe' },
    role: CrossCheckMessageDtoRoleEnum.Student,
    isReviewerRead: true,
    isStudentRead: true,
  },
  currentRole: CrossCheckMessageDtoRoleEnum.Student,
  settings: {
    areContactsVisible: true,
  },
};

describe('Message', () => {
  test('renders message details and read-state variants', () => {
    const { rerender } = render(<Message {...messageProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2022-03-15 00:00')).toBeInTheDocument();
    expect(screen.getByText(messageProps.message.role)).toBeInTheDocument();
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();

    const { reviewNumber: _omit, ...rest } = messageProps;
    rerender(<Message {...rest} />);
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    rerender(
      <Message
        {...messageProps}
        currentRole={CrossCheckMessageDtoRoleEnum.Reviewer}
        message={{ ...messageProps.message, isReviewerRead: false, isStudentRead: false }}
      />,
    );
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();

    rerender(<Message {...messageProps} />);
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
  });
});
