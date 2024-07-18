import { Typography } from 'antd';
import { CrossCheckCriteriaDataDto } from 'api';
import { getCriteriaStatusColor } from 'modules/CrossCheck';
import { TaskType } from '../../constants';

const { Text, Title } = Typography;

type Props = {
  criteria: CrossCheckCriteriaDataDto[] | null;
};

export function CrossCheckCriteria({ criteria }: Props) {
  if (!criteria?.length) return null;
  const penaltyData = criteria.filter(
    criteriaItem => criteriaItem.type.toLocaleLowerCase() === TaskType.Penalty && criteriaItem.point,
  );

  return (
    <>
      {criteria
        .filter(criteriaItem => criteriaItem.type.toLocaleLowerCase() === TaskType.Subtask)
        .map(criteriaItem => {
          const backgroundColor = getCriteriaStatusColor(criteriaItem.point ?? 0, criteriaItem.max);

          return (
            <div
              key={criteriaItem.key}
              style={{ border: '1px solid #F5F5F5', margin: '24px 0', paddingBottom: '14px', backgroundColor }}
            >
              <div
                style={{
                  display: 'block',
                  fontSize: '14px',
                  background: '#FAFAFA',
                  borderBottom: '1px solid #F5F5F5',
                  padding: '14px 12px',
                  marginBottom: '14px',
                }}
              >
                <Text>{criteriaItem.text}</Text>
              </div>

              {criteriaItem.textComment && (
                <div style={{ padding: '0 12px', fontSize: '16px' }}>
                  <Text strong={true}>Comment:</Text>
                  {criteriaItem.textComment?.split('\n').map((textLine, k) => (
                    <p key={k} style={{ margin: '0px 0 5px 0' }}>
                      {textLine}
                    </p>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '16px', padding: '0 12px' }}>
                <Text strong={true}>Points for criteria: {`${criteriaItem.point ?? 0}/${criteriaItem.max}`}</Text>
              </div>
            </div>
          );
        })}
      {penaltyData?.length ? (
        <div style={{ marginTop: '20px' }}>
          <Title level={4}>Penalty</Title>
          {penaltyData?.map(criteriaItem => (
            <div
              key={criteriaItem.key}
              style={{
                display: 'inline-block',
                width: '100%',
                backgroundColor: '#fff2f2',
                border: '1px #ffb0b0 solid',
                padding: '14px 12px',
              }}
            >
              <Text>
                {criteriaItem.text} {criteriaItem.point ?? 0}
              </Text>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
