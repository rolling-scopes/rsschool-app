import React from 'react';
import { Button } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';

type Props = {
  maxDonatorsShown: number;
};

function Donation(props: Props) {
  const { maxDonatorsShown } = props;

  const widgetUrlPartial = `https://opencollective.com/rsschool/backers.svg?avatarHeight=36&button=false&width=300&limit=${maxDonatorsShown}`;

  return (
    <>
      <h3>Thank you for your support!</h3>
      <h4>Top {maxDonatorsShown} donators:</h4>
      <p style={{ overflow: 'hidden' }}>
        <object type="image/svg+xml" data={widgetUrlPartial} />
      </p>
      <p>
        <Button href="https://opencollective.com/rsschool#section-contribute" target="_blank">
          <HeartTwoTone twoToneColor="#eb2f96" />
          ️Make a donation
        </Button>
      </p>
    </>
  );
}

export { Donation };
