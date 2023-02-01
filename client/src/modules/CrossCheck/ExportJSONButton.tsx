import { FileOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { CriteriaDto } from 'api';
import omit from 'lodash/omit';
import { TaskType } from './components/CrossCheckCriteriaForm';
import { CriteriaJSONType } from './UploadCriteriaJSON';

interface Props {
  dataCriteria: CriteriaDto[];
}

export function ExportJSONButton({ dataCriteria }: Props) {
  const transformCriteriaData = (criteria: CriteriaDto[]) => {
    const transformedCriteria = criteria.map(item => {
      let editedItem: Partial<CriteriaJSONType> = { ...item };

      if (editedItem.type === TaskType.Title) {
        editedItem.title = editedItem.text;
        delete editedItem.text;
      }
      editedItem = omit(editedItem, ['key', 'index']);
      return editedItem;
    });
    return { criteria: transformedCriteria };
  };

  const criteriaStringify = encodeURIComponent(JSON.stringify(transformCriteriaData(dataCriteria)));
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
