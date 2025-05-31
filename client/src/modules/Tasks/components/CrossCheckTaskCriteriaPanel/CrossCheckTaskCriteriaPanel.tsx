import { Divider, Flex, Form } from 'antd';
import { CriteriaDto } from 'api';
import {
  addKeyAndIndex,
  UploadCriteriaJSON,
  AddCriteriaForCrossCheck,
  EditableTable,
  ExportJSONButton,
} from 'modules/CrossCheck';
import { DeleteAllCrossCheckCriteriaButton } from 'modules/CrossCheck/DeleteAllCrossCheckCriteriaButton';
import { LABELS } from 'modules/Tasks/constants';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  dataCriteria: CriteriaDto[];
  setDataCriteria: Dispatch<SetStateAction<CriteriaDto[]>>;
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
          <Flex gap={'10px'} justify={'flex-end'}>
            <DeleteAllCrossCheckCriteriaButton setDataCriteria={setDataCriteria} />
            <ExportJSONButton dataCriteria={dataCriteria} />
          </Flex>
        </>
      ) : null}
    </>
  );
}
