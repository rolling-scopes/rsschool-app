import { Modal, Typography } from 'antd';

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
          <div style={{ border: '1px solid #F5F5F5', margin: '24px 0', paddingBottom: '14px' }}>
            <Text
              style={{
                display: 'block',
                fontSize: '14px',
                background: '#FAFAFA',
                borderBottom: '1px solid #F5F5F5',
                padding: '14px 12px',
                marginBottom: '14px',
              }}
            >
              {criteriaItem.text}
            </Text>
            {criteriaItem.textComment && (
              <div style={{ padding: '0 12px' }}>
                <Text style={{ fontSize: '16px' }} strong={true}>
                  Comment:
                </Text>
                {criteriaItem.textComment?.split('\n').map((textLine, k) => (
                  <p key={k} style={{ margin: '0px 0 5px 0' }}>
                    {textLine}
                  </p>
                ))}
              </div>
            )}
            <Text style={{ fontSize: '16px', padding: '0 12px' }} strong={true}>
              Points for criteria: {`${criteriaItem.point ?? 0}/${criteriaItem.max}`}
            </Text>
          </div>
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
              style={{
                display: 'inline-block',
                width: '100%',
                backgroundColor: '#fff2f2',
                border: '1px #ffb0b0 solid',
                padding: '14px 12px',
              }}
            >
              {criteriaItem.text} {criteriaItem.point ?? 0}
            </Text>
          </>
        ))}
    </Modal>
  );
}
