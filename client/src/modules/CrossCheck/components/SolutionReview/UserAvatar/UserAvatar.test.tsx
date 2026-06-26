import { render } from '@testing-library/react';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';
import { CrossCheckMessageAuthor } from '@client/services/course';
import UserAvatar from './UserAvatar';

const author: CrossCheckMessageAuthor = { id: 1, githubId: 'octocat' };

function getAvatarImg(container: HTMLElement) {
  return container.querySelector('img') as HTMLImageElement;
}

describe('<UserAvatar />', () => {
  it('uses the github avatar for a reviewer when contacts are visible', () => {
    const { container } = render(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible size={32} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', 'https://cdn.rs.school/avatars/octocat.png?size=64');
  });

  it('uses the expert icon for a reviewer when contacts are hidden', () => {
    const { container } = render(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible={false} size={32} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Expert.svg');
  });

  it('uses the expert icon for a reviewer when author is null', () => {
    const { container } = render(
      <UserAvatar author={null} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible size={32} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Expert.svg');
  });

  it('uses the github avatar for a student when contacts are visible (size doubled)', () => {
    const { container } = render(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Student} areContactsVisible size={24} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', 'https://cdn.rs.school/avatars/octocat.png?size=48');
  });

  it('uses the thanks icon for a student when contacts are hidden', () => {
    const { container } = render(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Student} areContactsVisible={false} size={24} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Thanks.svg');
  });
});
