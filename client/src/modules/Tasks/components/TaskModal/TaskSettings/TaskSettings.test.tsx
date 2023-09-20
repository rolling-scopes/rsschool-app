import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TaskSettings } from './TaskSettings';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, TASK_SETTINGS_HEADERS } from 'modules/Tasks/constants';
import { CriteriaDto } from 'api';

type PanelCriteria = keyof typeof TASK_SETTINGS_HEADERS;

const criteriaMock: CriteriaDto = { type: 'title', text: 'Title', key: 'key', index: 1 };

const renderTaskSettings = (dataCriteria: CriteriaDto[] = [], setDataCriteria = jest.fn()) => {
  render(
    <Form>
      <TaskSettings dataCriteria={dataCriteria} setDataCriteria={setDataCriteria} />
    </Form>,
  );
};

const expendPanel = async (panelType: PanelCriteria) => {
  const panel = await screen.findByText(TASK_SETTINGS_HEADERS[panelType]);
  fireEvent.click(panel);
};

describe('TaskSettings', () => {
  test.each`
    header
    ${TASK_SETTINGS_HEADERS.crossCheckCriteria}
    ${TASK_SETTINGS_HEADERS.github}
    ${TASK_SETTINGS_HEADERS.jsonAttributes}
  `('should render task setting panel $header', async ({ header }) => {
    renderTaskSettings();

    const panel = await screen.findByText(header);
    expect(panel).toBeInTheDocument();
  });

  describe('Criteria For Cross-Check Task', () => {
    test.each`
      label
      ${LABELS.crossCheckCriteria}
    `('should render fields with $label label', async ({ label }) => {
      renderTaskSettings();

      await expendPanel('crossCheckCriteria');

      const field = await screen.findByText(label);
      expect(field).toBeInTheDocument();
    });

    // AddCriteriaForCrossCheck
    test('should render "Criteria Type" field', async () => {
      renderTaskSettings();

      await expendPanel('crossCheckCriteria');

      const field = await screen.findByText('Criteria Type');
      expect(field).toBeInTheDocument();
    });

    // Divider
    test('should render divider', async () => {
      renderTaskSettings([criteriaMock]);

      await expendPanel('crossCheckCriteria');

      const divider = await screen.findByRole('separator');
      expect(divider).toBeInTheDocument();
    });

    test('should not render divider when no dataCriteria', async () => {
      renderTaskSettings();

      await expendPanel('crossCheckCriteria');

      const divider = screen.queryByRole('separator');
      expect(divider).not.toBeInTheDocument();
    });

    // EditableTable
    test('should render criteria table', async () => {
      renderTaskSettings([criteriaMock]);

      await expendPanel('crossCheckCriteria');

      const table = await screen.findByRole('table');
      expect(table).toBeInTheDocument();
    });

    test('should not render criteria table when no dataCriteria', async () => {
      renderTaskSettings();

      await expendPanel('crossCheckCriteria');

      const table = screen.queryByRole('table');
      expect(table).not.toBeInTheDocument();
    });

    // ExportJSONButton
    test('should render "Export JSON" button', async () => {
      renderTaskSettings([criteriaMock]);

      await expendPanel('crossCheckCriteria');

      const button = await screen.findByRole('button', { name: /export json/i });
      expect(button).toBeInTheDocument();
    });

    test('should not render "Export JSON" button when no dataCriteria', async () => {
      renderTaskSettings();

      await expendPanel('crossCheckCriteria');

      const button = screen.queryByRole('button', { name: /export json/i });
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Github', () => {
    test.each`
      label
      ${LABELS.repoUrl}
      ${LABELS.expectedRepoName}
    `('should render fields with $label label', async ({ label }) => {
      renderTaskSettings();

      await expendPanel('github');

      const field = await screen.findByText(label);
      expect(field).toBeInTheDocument();
    });

    test('should render "Pull Request required" checkbox', async () => {
      renderTaskSettings();

      await expendPanel('github');

      const checkbox = await screen.findByRole('checkbox', { name: /pull request required/i });
      expect(checkbox).toBeInTheDocument();
    });

    test.each`
      placeholder
      ${PLACEHOLDERS.sourceGithubRepoUrl}
      ${PLACEHOLDERS.githubRepoName}
    `('should render field with $placeholder placeholder', async ({ placeholder }) => {
      renderTaskSettings();

      await expendPanel('github');

      const field = await screen.findByPlaceholderText(placeholder);
      expect(field).toBeInTheDocument();
    });

    test('should render error message on invalid source Github repo URL input', async () => {
      renderTaskSettings();

      await expendPanel('github');

      const field = await screen.findByPlaceholderText(PLACEHOLDERS.sourceGithubRepoUrl);
      expect(field).toBeInTheDocument();

      fireEvent.change(field, { target: { value: 'http://github.com/i-vasilich-i' } });

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.sourceGithubRepoUrl);
    });

    test('should not render error message on valid source Github repo URL input', async () => {
      renderTaskSettings();

      await expendPanel('github');

      const field = await screen.findByPlaceholderText(PLACEHOLDERS.sourceGithubRepoUrl);
      expect(field).toBeInTheDocument();

      fireEvent.change(field, { target: { value: 'https://github.com/rolling-scopes-school/task1' } });

      await waitFor(() => {
        const errorMessage = screen.queryByText(ERROR_MESSAGES.sourceGithubRepoUrl);
        expect(errorMessage).not.toBeInTheDocument();
      });
    });
  });

  describe('JSON Attributes', () => {
    test('should render attributes textarea', async () => {
      renderTaskSettings();

      await expendPanel('jsonAttributes');

      const textarea = await screen.findByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveProperty('placeholder', PLACEHOLDERS.jsonAttributes);
    });

    test('should render error message on invalid JSON input', async () => {
      renderTaskSettings();

      await expendPanel('jsonAttributes');
      const invalidJson = `{ name: 'Pit' }`;

      const textarea = await screen.findByRole('textbox');
      expect(textarea).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: invalidJson } });

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.invalidJson);
    });
  });
});
