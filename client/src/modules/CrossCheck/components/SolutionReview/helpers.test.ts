import { CrossCheckMessageDto, CrossCheckMessageDtoRoleEnum } from '@client/api';
import { getAmountUnreadMessages, getHowManyUnreadMessagesText } from './helpers';

function message(overrides: Partial<CrossCheckMessageDto> = {}): CrossCheckMessageDto {
  return {
    author: null,
    content: 'hi',
    timestamp: '2024-01-01T00:00:00.000Z',
    isReviewerRead: true,
    isStudentRead: true,
    role: CrossCheckMessageDtoRoleEnum.Student,
    ...overrides,
  };
}

describe('getAmountUnreadMessages', () => {
  const messages = [
    message({ isReviewerRead: false, isStudentRead: true }),
    message({ isReviewerRead: true, isStudentRead: false }),
    message({ isReviewerRead: false, isStudentRead: false }),
  ];

  it('counts messages unread by the reviewer', () => {
    expect(getAmountUnreadMessages(CrossCheckMessageDtoRoleEnum.Reviewer, messages)).toBe(2);
  });

  it('counts messages unread by the student', () => {
    expect(getAmountUnreadMessages(CrossCheckMessageDtoRoleEnum.Student, messages)).toBe(2);
  });

  it('returns 0 for an unknown role', () => {
    expect(getAmountUnreadMessages('unknown' as CrossCheckMessageDtoRoleEnum, messages)).toBe(0);
  });
});

describe('getHowManyUnreadMessagesText', () => {
  it('uses the singular form for a single message', () => {
    expect(getHowManyUnreadMessagesText(1)).toBe('You have 1 unread message');
  });

  it('uses the plural form for multiple messages', () => {
    expect(getHowManyUnreadMessagesText(3)).toBe('You have 3 unread messages');
  });
});
