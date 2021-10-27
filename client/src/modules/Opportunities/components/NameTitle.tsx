import React from 'react';
import { UserData } from 'common/models/cv';
import { AvatarCV } from 'modules/Opportunities/components/AvatarCV';

type Props = {
  userData: UserData;
};

export function NameTitle({ userData }: Props) {
  const { name, avatarLink, desiredPosition } = userData;

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <div style={{ paddingRight: 16 }}>
          <AvatarCV src={avatarLink} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, lineHeight: '28px' }}>{name}</div>
        <div style={{ fontSize: 18, paddingTop: 8 }}>{desiredPosition}</div>
      </div>
    </div>
  );
}
