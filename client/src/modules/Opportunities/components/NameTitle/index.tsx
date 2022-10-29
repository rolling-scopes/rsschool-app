import React from 'react';
import { UserData } from 'modules/Opportunities/models';
import { AvatarCv } from '../AvatarCv';

type Props = {
  userData: UserData;
};

export const NameTitle = ({ userData }: Props) => {
  const { name, avatarLink, desiredPosition } = userData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ paddingRight: 16 }}>
          <AvatarCv src={avatarLink} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, lineHeight: '28px' }}>{name}</div>
        <div style={{ fontSize: 18, paddingTop: 8 }}>{desiredPosition}</div>
      </div>
    </div>
  );
};
