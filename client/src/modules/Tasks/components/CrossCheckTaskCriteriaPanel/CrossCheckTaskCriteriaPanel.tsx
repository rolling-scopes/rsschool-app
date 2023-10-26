import { Divider, Form } from 'antd';
import { CriteriaDto } from 'api';
import {
  addKeyAndIndex,
  UploadCriteriaJSON,
  AddCriteriaForCrossCheck,
  EditableTable,
  ExportJSONButton,
} from 'modules/CrossCheck';
import { LABELS } from 'modules/Tasks/constants';

type Props = {
  dataCriteria: CriteriaDto[];
  setDataCriteria: (c: CriteriaDto[]) => void;
};

export function CrossCheckTaskCriteriaPanel({ dataCriteria, setDataCriteria }: Props) {
  const addCriteria = (criteria: CriteriaDto) => {
    const newDataCriteria = [...dataCriteria, criteria];
    setDataCriteria(addKeyAndIndex(newDataCriteria));
  };

  const addJSONtoCriteria = (criteria: CriteriaDto[]) => {
    const newCriteria = [...dataCriteria, ...criteria];
    setDataCriteria(addKeyAndIndex(newCriteria));
  };

  return (
    <>
      <Form.Item label={LABELS.crossCheckCriteria}>
        <UploadCriteriaJSON onLoad={addJSONtoCriteria} />
      </Form.Item>
      <AddCriteriaForCrossCheck onCreate={addCriteria} />
      {dataCriteria.length ? (
        <>
          <Divider />
          <EditableTable dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
          <ExportJSONButton dataCriteria={dataCriteria} />
        </>
      ) : null}
    </>
  );
}
