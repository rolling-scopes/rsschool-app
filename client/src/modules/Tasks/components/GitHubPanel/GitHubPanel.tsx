import { Form, Checkbox, Input } from 'antd';
import { LABELS, ERROR_MESSAGES, PLACEHOLDERS } from 'modules/Tasks/constants';
import { githubRepoUrl } from 'services/validators';

export function GitHubPanel() {
  return (
    <>
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
    </>
  );
}
