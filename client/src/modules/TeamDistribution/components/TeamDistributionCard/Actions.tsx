import { Button, Modal, Row, Space, Typography } from 'antd';
import Link from 'next/link';
import { DownOutlined } from '@ant-design/icons';
import { TextProps } from 'antd/lib/typography/Text';
import { TeamDistributionDto, TeamDistributionDtoRegistrationStatusEnum } from '@client/api';
import { dateWithTimeZoneRenderer } from '@client/shared/components/Table';
import dayjs from 'dayjs';

const { Text, Link: LinkButton } = Typography;

type Props = {
  distribution: TeamDistributionDto;
  register: (distributionId: number) => Promise<void>;
  deleteRegister: (distributionId: number) => Promise<void>;
  isManager: boolean;
  isCourseDementor?: boolean;
  courseAlias: string;
  onOpenSubmitScoreModal: () => void;
};

const getDateColor = (date: string): TextProps['type'] => {
  const now = dayjs();
  const currentDate = dayjs(date);

  const isDeadlineSoon = now <= currentDate && currentDate.diff(now, 'hours') < 48;

  if (isDeadlineSoon) return 'danger';
};

export function Actions({
  distribution,
  register,
  deleteRegister,
  isManager,
  isCourseDementor,
  courseAlias,
  onOpenSubmitScoreModal,
}: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const endDateText = dateWithTimeZoneRenderer(timezone, 'YYYY-MM-DD HH:mm')(distribution.endDate);
  const [modal, contextHolder] = Modal.useModal();

  const handleCancel = async () => {
    modal.confirm({
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
      {contextHolder}
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
              {dayjs() > dayjs(distribution.endDate) ? 'Registration is closed' : renderRegistrationCancelSection()}
            </Text>
          </>
        );
      case TeamDistributionDtoRegistrationStatusEnum.Distributed:
        return (
          <Button icon={<DownOutlined />} disabled>
            Registered
          </Button>
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

  return distribution.registrationStatus !== TeamDistributionDtoRegistrationStatusEnum.Unavailable ||
    isManager ||
    isCourseDementor ? (
    <Row style={{ marginTop: 16 }}>
      <Space size={24} wrap>
        {(isManager ||
          isCourseDementor ||
          distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Completed ||
          distribution.registrationStatus === TeamDistributionDtoRegistrationStatusEnum.Distributed) && (
          <Link href={`teams?course=${courseAlias}&teamDistributionId=${distribution.id}`}>
            <Button type="primary">Connect with teams</Button>
          </Link>
        )}
        {isManager && (
          <Button type="dashed" onClick={onOpenSubmitScoreModal}>
            Submit score
          </Button>
        )}
        {renderActions()}
      </Space>
    </Row>
  ) : null;
}
