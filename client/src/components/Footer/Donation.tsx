import React from 'react';
import { Button } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';

class Donation extends React.Component<any, any> {
  render() {
    return (
      <>
        <h3>Thank you for your support!</h3>
        <p>
          <object
            type="image/svg+xml"
            data="https://opencollective.com/rsschool/backers.svg?avatarHeight=36&button=false&width=300"
          />
        </p>
        <p>
          <Button href="https://opencollective.com/rsschool#section-contribute" target="_blank">
            <HeartTwoTone twoToneColor="#eb2f96" />️Make a donation
          </Button>
        </p>
      </>
    );
  }
}

export { Donation };
