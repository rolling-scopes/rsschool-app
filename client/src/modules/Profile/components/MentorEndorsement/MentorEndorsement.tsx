import { Alert, Input, Modal, Spin, Typography } from 'antd';
import { useMemo } from 'react';
import { ProfileApi } from 'api';
import { useAsync } from 'react-use';
import isNull from 'lodash/isNull';
import isObject from 'lodash/isObject';
import omitBy from 'lodash/omitBy';

export interface Props {
  open: boolean;
  githubId: string;
  onClose: () => void;
}

const api = new ProfileApi();

export function MentorEndorsement(props: Props) {
  const { value, loading, error } = useAsync(async () => {
    if (props.open) {
      const { data } = await api.getEndorsement(props.githubId);
      return data;
    }
  }, [props.githubId, props.open]);

  const data = useMemo(() => (value?.data ? cleanData(value.data) : null), [value?.data]);

  return (
    <Modal
      width={640}
      onCancel={props.onClose}
      cancelButtonProps={{ hidden: true }}
      onOk={props.onClose}
      open={props.open}
    >
      <Spin spinning={loading}>
        <div style={{ minHeight: 320, paddingTop: 32 }}>
          {error ? (
            <Alert
              closable={false}
              message="Error occurred while generating endorsment"
              description={error.message}
              type="error"
            />
          ) : null}

          {value ? (
            <>
              <Typography.Title level={4}>Generated Text</Typography.Title>
              <Typography.Paragraph style={{ fontSize: 13 }} copyable={{ text: value?.summary }}>
                {value?.summary.split('\n').map(i => (
                  <>
                    {i}
                    <br />
                  </>
                ))}
              </Typography.Paragraph>
            </>
          ) : null}
        </div>

        {data ? (
          <div>
            <Typography.Title level={4}>Data Model</Typography.Title>
            <Input.TextArea rows={12} readOnly value={JSON.stringify(data, null, 4)} />
          </div>
        ) : null}
      </Spin>
    </Modal>
  );
}

function removeNull(obj: object) {
  return omitBy(obj, isNull);
}

function cleanData(obj: object) {
  const cleanedObj = removeNull(obj);

  // Recursively clean nested objects
  for (const key in cleanedObj) {
    if (isObject(cleanedObj[key])) {
      cleanedObj[key] = cleanData(cleanedObj[key]);
    }
  }

  return cleanedObj;
}
