import * as React from 'react';
import { Button, Modal, List, Result, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
const { Item } = List;

type Props = {
  isOwner: boolean;
  giveConsent?: () => void;
};

function NoConsentViewCV(props: Props) {
  const { isOwner, giveConsent } = props;

  const confirmationModalInfo = {
    en: {
      header: 'Are you sure? The following information will be available to recruiters:',
      availableDataList: [
        'Personal information (name, desired position, English level, military service, avatar, link to self-presentation, short self-description, etc.);',
        'Contact details (phone, email, skype, telegram, linkedIn, location to work, github, website link);',
        'Information about passed school courses (courses info, mentor, course status, score, position);',
        'Public feedback information (grattitudes)',
      ],
    },
    ru: {
      header: 'Вы уверены? Следующая информация будет доступна рекрутерам:',
      availableDataList: [
        'Личная информация (имя, желаемая позиция, уровень английского, отношение к военное службе, аватар, ссылка на самопрезентацию, краткое самоописание и т.д.);',
        'Контактные данные (телефон, электронная почта, скайп, телеграм, linkedIn, локация, в которой хотите работать, гитхаб, ссылка на вебсайт);',
        'Информация о пройденных в школе курсах (в каких курсах принято участие, статус курса для участника, скор, место в скоре);',
        'Информация о публичной обратной связи (grattitudes)',
      ],
    },
  };

  const confirmationModalContent = (
    <List
      header={
        <Tooltip placement="topLeft" title={confirmationModalInfo.ru.header}>
          {confirmationModalInfo.en.header}
        </Tooltip>
      }
      dataSource={confirmationModalInfo.en.availableDataList}
      renderItem={(item, idx) => (
        <Tooltip placement="topLeft" title={confirmationModalInfo.ru.availableDataList[idx]}>
          <Item>{item}</Item>
        </Tooltip>
      )}
    />
  );

  const showConfirmationModal = () => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: 'Are you sure?',
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
      title="To create your CV page for recruiters to view, you need to allow the use and processing of your data."
      extra={
        <Button htmlType="button" onClick={showConfirmationModal}>
          Give consent
        </Button>
      }
    />
  ) : (
    <Result status={403} title="This user doesn't have CV yet" />
  );
}

export default NoConsentViewCV;
