import { Collapse, Form, Divider, Checkbox, Input } from 'antd';
import { CriteriaDto } from 'api';
import {
  addKeyAndIndex,
  UploadCriteriaJSON,
  AddCriteriaForCrossCheck,
  EditableTable,
  ExportJSONButton,
} from 'modules/CrossCheck';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from 'modules/Tasks/constants';
import { githubRepoUrl } from 'services/validators';

type Props = {
  dataCriteria: CriteriaDto[];
  setDataCriteria: (c: CriteriaDto[]) => void;
};

export function TaskSettings({ dataCriteria, setDataCriteria }: Props) {
  const addCriteria = (criteria: CriteriaDto) => {
    const newDataCriteria = [...dataCriteria, criteria];
    setDataCriteria(addKeyAndIndex(newDataCriteria));
  };

  const addJSONtoCriteria = (criteria: CriteriaDto[]) => {
    const newCriteria = [...dataCriteria, ...criteria];
    setDataCriteria(addKeyAndIndex(newCriteria));
  };

  return (
    <Collapse>
      <Collapse.Panel header="Criteria For Cross-Check Task" key="1" forceRender>
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
      </Collapse.Panel>
      <Collapse.Panel header="Github" key="2" forceRender>
        <Form.Item name="githubPrRequired" valuePropName="checked">
          <Checkbox>Pull Request required</Checkbox>
        </Form.Item>
        <Form.Item
          name="sourceGithubRepoUrl"
          label={LABELS.repoUrl}
          rules={[{ pattern: githubRepoUrl, message: ERROR_MESSAGES.sourceGithubRepoUrl }]}
        >
          <Input placeholder={PLACEHOLDERS.sourceGithubRepoUrl} />
        </Form.Item>
        <Form.Item name="githubRepoName" label={LABELS.expectedRepoName}>
          <Input placeholder={PLACEHOLDERS.githubRepoName} />
        </Form.Item>
      </Collapse.Panel>
      <Collapse.Panel header="JSON Attributes" key="3" forceRender>
        <Form.Item
          name="attributes"
          rules={[
            {
              validator: async (_, value: string) => (value ? JSON.parse(value) : Promise.resolve()),
              message: ERROR_MESSAGES.invalidJson,
            },
          ]}
        >
          <Input.TextArea rows={6} placeholder={PLACEHOLDERS.jsonAttributes} />
        </Form.Item>
      </Collapse.Panel>
    </Collapse>
  );
}
