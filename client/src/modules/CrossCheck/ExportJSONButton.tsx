import { CriteriaData } from 'services/course';
import { FileOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import _ from 'lodash';

interface Props {
  dataCriteria: CriteriaData[];
}

export function ExportJSONButton({ dataCriteria }: Props) {
  const removeKeyAndIndex = (criteria: CriteriaData[]) => {
    return criteria.map(item => _.omit(item, ['key', 'index']));
  };

  const criteriaStringify = encodeURIComponent(JSON.stringify(removeKeyAndIndex(dataCriteria)));
  const href = `data:text/json;charset=utf-8,${criteriaStringify}`;

  return (
    <div style={{ textAlign: 'right' }}>
      <Button icon={<FileOutlined style={{ marginRight: 5 }} />} style={{ marginTop: 15 }}>
        <a href={href} download="crossCheckCriteria.json">
          Export JSON
        </a>
      </Button>
    </div>
  );
}
