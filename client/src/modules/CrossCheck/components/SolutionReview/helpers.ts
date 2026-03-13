import { CrossCheckMessageDto, CrossCheckMessageDtoRoleEnum } from '@client/api';

export const getAmountUnreadMessages = (
  currentRole: CrossCheckMessageDtoRoleEnum,
  messages: CrossCheckMessageDto[],
): number => {
  switch (currentRole) {
    case CrossCheckMessageDtoRoleEnum.Reviewer:
      return messages.filter(messages => !messages.isReviewerRead).length;

    case CrossCheckMessageDtoRoleEnum.Student:
      return messages.filter(messages => !messages.isStudentRead).length;

    default:
      return 0;
  }
};

export const getHowManyUnreadMessagesText = (amountUnreadMessages: number): string => {
  return `You have ${amountUnreadMessages} unread ${amountUnreadMessages > 1 ? 'messages' : 'message'}`;
};
