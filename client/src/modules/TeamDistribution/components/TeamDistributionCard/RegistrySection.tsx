import { Button, Row, Space, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { TextProps } from 'antd/lib/typography/Text';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from 'api';
import { dateWithTimeZoneRenderer } from 'components/Table';
import moment from 'moment';

const { Text } = Typography;

type Props = {
  distribution: TeamDistributionDto;
  onRegister: (distributionId: number) => Promise<void>;
};

const getDateColor = (date: string): TextProps['type'] => {
  const now = moment();
  const currentDate = moment(date);

  const isDeadlineSoon = now <= currentDate && currentDate.diff(now, 'hours') < 48;

  if (isDeadlineSoon) return 'danger';
};

export function RegistrySection({ distribution, onRegister }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  switch (distribution.registrationStatus) {
    case TeamDistributionDtoRegistrationStatusEnum.Future:
      return (
        <Row style={{ marginTop: 16 }}>
          <Space size={24}>
            <Button disabled>Register</Button>
            <Text type="secondary">Registration will be opened later</Text>
          </Space>
        </Row>
      );
    case TeamDistributionDtoRegistrationStatusEnum.Available:
      return (
        <Row style={{ marginTop: 16 }}>
          <Space size={24}>
            <Button type="primary" onClick={() => onRegister(distribution.id)}>
              Register
            </Button>
            <Text type={getDateColor(distribution.endDate)}>
              Register before {dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(distribution.endDate)}
            </Text>
          </Space>
        </Row>
      );
    case TeamDistributionDtoRegistrationStatusEnum.Completed:
      return (
        <Row style={{ marginTop: 16 }}>
          <Space size={24}>
            <Button icon={<DownOutlined />} disabled>
              Registered
            </Button>
          </Space>
        </Row>
      );

    default:
      return null;
  }
}
