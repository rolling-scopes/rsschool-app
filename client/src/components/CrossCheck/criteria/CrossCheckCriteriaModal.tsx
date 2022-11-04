import { Modal, Typography, Divider } from 'antd';

import { CrossCheckCriteriaData } from '../CrossCheckCriteriaForm';

const { Text, Title } = Typography;

export function CrossCheckCriteriaModal(props: {
  modalInfo: CrossCheckCriteriaData[] | null;
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
}) {
  const handleOk = () => {
    props.setIsModalVisible(false);
  };

  const handleCancel = () => {
    props.setIsModalVisible(false);
  };

  return (
    <Modal title="Feedback" visible={props.isModalVisible} onOk={handleOk} onCancel={handleCancel} width={1000}>
      {props.modalInfo
        ?.filter(criteriaItem => criteriaItem.type.toLocaleLowerCase() === 'subtask')
        .map(criteriaItem => (
          <>
            <Text style={{ display: 'block', margin: '20px 0 0px 0', fontSize: '14px' }}>
              {criteriaItem.text}
            </Text>
            {criteriaItem.textComment && (
              <>
                <Text style={{ fontSize: '16px' }} strong={true}>
                  Comment:
                </Text>
                {criteriaItem.textComment?.split('\n').map((textLine, k) => (
                  <p key={k} style={{ margin: '0px 0 5px 0' }}>
                    {textLine}
                  </p>
                ))}
              </>
            )}
            <Text style={{ fontSize: '16px' }} strong={true}>
              Points for criteria: {`${criteriaItem.point ?? 0}/${criteriaItem.max}`}
            </Text>
            <Divider />
          </>
        ))}
      {!!props.modalInfo
        ?.filter(criteriaItem => criteriaItem.type.toLocaleLowerCase() === 'penalty')
        .filter(criteriaItem => criteriaItem.point).length && (
        <Title level={4} style={{ margin: '20px 0 5px 0' }}>
          Penalty
        </Title>
      )}
      {props.modalInfo
        ?.filter(criteriaItem => criteriaItem.type.toLocaleLowerCase() === 'penalty')
        .filter(criteriaItem => criteriaItem.point)
        .map(criteriaItem => (
          <>
            <Text
              italic={true}
              style={{ display: 'inline-block', margin: '15px 0 0px 0', fontSize: '16px' }}
            >
              {criteriaItem.text}
            </Text>
            <Text style={{ display: 'inline-block', margin: '0 0 0 5px', fontSize: '16px' }} strong={true}>
              {criteriaItem.point ?? 0}
            </Text>
            <br />
          </>
        ))}
    </Modal>
  );
}
