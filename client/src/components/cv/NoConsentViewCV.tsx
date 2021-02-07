import * as React from 'react';
import { Typography, Button, Modal, List } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
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
        'Personal information (name, desired position, English level, military service, avatar, link to self-presentation, short self-description);',
        'Contact details (phone, email, skype, telegram, linkedIn, location, github, website link);',
        'Information about the courses taken at the school (in which courses he takes part, result, speed, position in the near future);',
        'Public feedback information (grattitudes)'
      ]
    },
    ru: {
      header: 'Вы уверены? Следующая информация будет доступна рекрутерам:',
      availableDataList: [
        'Личная информация (имя, желаемая позиция, уровень английского, отношение к военное службе, аватар, ссылка на самопрезентацию, краткое самоописание);',
        'Контактные данные (телефон, электронная почта, скайп, телеграм, linkedIn, местоположение, гитхаб, ссылка на вебсайт);',
        'Информация о пройденных в школе курсах (в каких курсах принимает участие, результат, скор, позиция в скоре);',
        'Информация о публичной обратной связи (grattitudes)'
      ]
    }
  };

  const confirmationModalContent = (
    <>
      <List
        header={confirmationModalInfo.en.header}
        dataSource={confirmationModalInfo.en.availableDataList}
        renderItem={item => <Item>{item}</Item>}
      />
    </>
  );

  const showConfirmationModal = () => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: 'Are you sure?',
      content: confirmationModalContent,
      maskClosable: true,
      onOk() {
        giveConsent!();
      }
    });
  };

  if (isOwner) {
    return (
      <>
        <Title>To create your CV page for recruiters to view, you need to allow the use and processing of your data.</Title>
        <Button htmlType='button' onClick={showConfirmationModal}>Give consent</Button>
      </>
    )
  } else {
    return (
      <Title>This user does not have a CV yet.</Title>
    )
  }
}

export default NoConsentViewCV;
