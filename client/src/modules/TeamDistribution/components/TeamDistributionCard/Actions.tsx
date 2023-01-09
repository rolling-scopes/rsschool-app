import { Button, Modal, Row, Space, Typography } from 'antd';
import Link from 'next/link';
import { DownOutlined } from '@ant-design/icons';
import { TextProps } from 'antd/lib/typography/Text';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from 'api';
import { dateWithTimeZoneRenderer } from 'components/Table';
import moment from 'moment';

const { Text, Link: LinkButton } = Typography;

type Props = {
  distribution: TeamDistributionDto;
  register: (distributionId: number) => Promise<void>;
  deleteRegister: (distributionId: number) => Promise<void>;
  isManager: boolean;
  courseAlias: string;
  mobileView: boolean;
};

const getDateColor = (date: string): TextProps['type'] => {
  const now = moment();
  const currentDate = moment(date);

  const isDeadlineSoon = now <= currentDate && currentDate.diff(now, 'hours') < 48;

  if (isDeadlineSoon) return 'danger';
};

export function Actions({ distribution, register, deleteRegister, isManager, courseAlias, mobileView }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const endDateText = dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(distribution.endDate);

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Cancel registration',
      content: (
        <>
          Are you sure you want to cancel your group task registration? You will be able to register again until{' '}
          {endDateText}.
        </>
      ),
      okText: 'Cancel Registration',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteRegister(distribution.id);
      },
    });
  };

  const renderRegistrationCancelSection = () => (
    <>
      You can{' '}
      <LinkButton type="danger" underline onClick={handleCancel}>
        Cancel
      </LinkButton>{' '}
      registration before {endDateText}
    </>
  );

  const renderActions = () => {
    switch (distribution.registrationStatus) {
      case TeamDistributionDtoRegistrationStatusEnum.Future:
        return (
          <>
            <Button disabled>Register</Button>
            <Text type="secondary">Registration will be opened later</Text>
          </>
        );
      case TeamDistributionDtoRegistrationStatusEnum.Available:
        return (
          <>
            <Button type="primary" onClick={() => register(distribution.id)}>
              Register
            </Button>
            <Text type={getDateColor(distribution.endDate)}>Register before {endDateText}</Text>
          </>
        );
      case TeamDistributionDtoRegistrationStatusEnum.Completed:
        return (
          <>
            <Button icon={<DownOutlined />} disabled>
              Registered
            </Button>
            <Text type="secondary">
              {moment() > moment(distribution.endDate) ? 'Registration is closed' : renderRegistrationCancelSection()}
            </Text>
          </>
        );
      case TeamDistributionDtoRegistrationStatusEnum.Closed:
        return (
          <>
            <Button disabled>Register</Button>
            <Text type="secondary">Registration is closed</Text>
          </>
        );

      default:
        return null;
    }
  };

  return distribution.registrationStatus !== TeamDistributionDtoRegistrationStatusEnum.Unavailable || isManager ? (
    <Row style={{ marginTop: 16 }}>
      <Space size={24} direction={mobileView ? 'vertical' : 'horizontal'}>
        {(isManager || distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Completed) && (
          <Link href={`teams?course=${courseAlias}&teamDistributionId=${distribution.id}`}>
            <Button type="link">Connect with teams</Button>
          </Link>
        )}
        {renderActions()}
      </Space>
    </Row>
  ) : null;
}
