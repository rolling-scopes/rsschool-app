import { render } from '@testing-library/react';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';
import { CrossCheckMessageAuthor } from '@client/services/course';
import UserAvatar from './UserAvatar';

const author: CrossCheckMessageAuthor = { id: 1, githubId: 'octocat' };

function getAvatarImg(container: HTMLElement) {
  return container.querySelector('img') as HTMLImageElement;
}

describe('<UserAvatar />', () => {
  it('selects the avatar for each role and visibility state', () => {
    const { container, rerender } = render(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible size={32} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', 'https://cdn.rs.school/avatars/octocat.png?size=64');

    rerender(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible={false} size={32} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Expert.svg');

    rerender(<UserAvatar author={null} role={CrossCheckMessageDtoRoleEnum.Reviewer} areContactsVisible size={32} />);

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Expert.svg');

    rerender(<UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Student} areContactsVisible size={24} />);

    expect(getAvatarImg(container)).toHaveAttribute('src', 'https://cdn.rs.school/avatars/octocat.png?size=48');

    rerender(
      <UserAvatar author={author} role={CrossCheckMessageDtoRoleEnum.Student} areContactsVisible={false} size={24} />,
    );

    expect(getAvatarImg(container)).toHaveAttribute('src', '/static/svg/sloths/Thanks.svg');
  });
});
