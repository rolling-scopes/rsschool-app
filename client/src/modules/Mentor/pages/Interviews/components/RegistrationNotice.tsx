import { Alert, Typography } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import moment from 'moment';
import React from 'react';
import { isInterviewRegistrationInProgess } from 'domain/interview';

export function RegistrationNotice(props: {
  name: string;
  startDate: string;
  showMentorOptions: (e: React.MouseEvent) => void;
}) {
  const { startDate, showMentorOptions, name } = props;

  if (!isInterviewRegistrationInProgess(startDate)) {
    return null;
  }

  return (
    <>
      <Alert
        message="Registration period"
        icon={<InfoCircleTwoTone />}
        showIcon
        description={
          <>
            <Typography.Text>
              Students’ registration for {name} continues until {moment(startDate).format('DD MMM hh:mm')}. You can
              change <a onClick={showMentorOptions}>mentoring options</a> till this date.
            </Typography.Text>
            <div className="icon-mentor" />
          </>
        }
        type="info"
        closable
      />
      <style jsx>{`
        .icon-mentor {
          background-image: url(https://cdn.rs.school/sloths/cleaned/mentor-new.svg);
          background-position: center;
          background-size: contain;
          width: 129px;
          height: 170px;
          margin: 10px auto;
        }
      `}</style>
    </>
  );
}
