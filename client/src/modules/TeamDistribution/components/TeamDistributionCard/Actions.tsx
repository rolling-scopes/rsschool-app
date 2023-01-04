import { Button, Modal, Row, Space, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { TextProps } from 'antd/lib/typography/Text';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from 'api';
import { dateWithTimeZoneRenderer } from 'components/Table';
import moment from 'moment';

const { Text, Link } = Typography;

type Props = {
  distribution: TeamDistributionDto;
  onRegister: (distributionId: number) => Promise<void>;
  onDeleteRegister: (distributionId: number) => Promise<void>;
};

const getDateColor = (date: string): TextProps['type'] => {
  const now = moment();
  const currentDate = moment(date);

  const isDeadlineSoon = now <= currentDate && currentDate.diff(now, 'hours') < 48;

  if (isDeadlineSoon) return 'danger';
};

export function Actions({ distribution, onRegister, onDeleteRegister }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Cancel registration',
      content: (
        <>
          Are you sure you want to cancel your group task registration? You will be able to register again until{' '}
          {dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(distribution.endDate)}.
        </>
      ),
      okText: 'Cancel Registration',
      okButtonProps: { danger: true },
      onOk: () => {
        onDeleteRegister(distribution.id);
      },
    });
  };

  const renderRegistrationCancelSection = () => (
    <>
      You can{' '}
      <Link type="danger" underline onClick={handleCancel}>
        Cancel
      </Link>{' '}
      registration before {dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(distribution.endDate)}
    </>
  );

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
            <Text type="secondary">
              {moment() > moment(distribution.endDate) ? 'Registration is closed' : renderRegistrationCancelSection()}
            </Text>
          </Space>
        </Row>
      );
    case TeamDistributionDtoRegistrationStatusEnum.Closed:
      return (
        <Row style={{ marginTop: 16 }}>
          <Space size={24}>
            <Button disabled>Register</Button>
            <Text type="secondary">Registration is closed</Text>
          </Space>
        </Row>
      );

    default:
      return null;
  }
}
