import * as React from 'react';
import { Button, Modal, List, Result, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Paragraph, Title } = Typography;
const { Item } = List;

type Props = {
  isOwner?: boolean;
  giveConsent?: () => void;
};

function NoConsentViewCV(props: Props) {
  const { isOwner, giveConsent } = props;

  const confirmationModalInfo = {
    en: {
      header: 'Are you sure? The following information will be public:',
      availableDataList: [
        'Personal information (Name, Desired Position, English level, Military Service, Avatar, Link to a presentation, Self-Description, etc.);',
        'Contact details (Phone, Email, Skype, Telegram, LinkedIn, Location, Github username, Website Link);',
        'Information about passed school courses (Courses Info, Mentor, Course Status, Score, Position);',
        'Public feedback information (Gratitudes)',
      ],
    },
    ru: {
      header: 'Вы уверены? Следующая информация будет доступна рекрутерам:',
      availableDataList: [
        'Личная информация (имя, желаемая позиция, уровень английского, отношение к военной службе, аватар, ссылка на самопрезентацию, краткое самоописание и т.д.);',
        'Контактные данные (телефон, электронная почта, Skype, Telegram, LinkedIn, локация, в которой хотите работать, Github, ссылка на веб-сайт);',
        'Информация о пройденных в школе курсах (в каких курсах принято участие, статус курса для участника, скор, место в скоре);',
        'Информация о публичной обратной связи (отзывы в RS School App)',
      ],
    },
  };

  const confirmationModalContent = (
    <List
      header={
        <Title level={4} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {confirmationModalInfo.en.header}
          <Tooltip placement="topLeft" title={confirmationModalInfo.ru.header}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Title>
      }
      dataSource={confirmationModalInfo.en.availableDataList}
      renderItem={(text, idx) => (
        <Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Paragraph>{text}</Paragraph>
          <Tooltip placement="topLeft" title={confirmationModalInfo.ru.availableDataList[idx]}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Item>
      )}
    />
  );

  const showConfirmationModal = () => {
    Modal.confirm({
      icon: null,
      content: confirmationModalContent,
      maskClosable: true,
      onOk() {
        giveConsent!();
      },
    });
  };

  return isOwner ? (
    <Result
      status="info"
      title={
        <>
          CV is public page. <br />
          We need your consent to use and process your personal data and make it public.
        </>
      }
      extra={
        <Button type="primary" htmlType="button" onClick={showConfirmationModal}>
          Give consent
        </Button>
      }
    />
  ) : (
    <Result status={403} title="This user doesn't have CV yet" />
  );
}

export default NoConsentViewCV;
