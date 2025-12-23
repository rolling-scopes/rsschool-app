import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from 'modules/Tasks/constants';
import { GitHubPanel } from './GitHubPanel';

const renderPanel = () => {
  render(
    <Form>
      <GitHubPanel />
    </Form>,
  );
};

describe('GitHub', () => {
  test.each`
    label
    ${LABELS.repoUrl}
    ${LABELS.expectedRepoName}
  `('should render fields with $label label', async ({ label }) => {
    renderPanel();

    const field = await screen.findByText(label);
    expect(field).toBeInTheDocument();
  });

  test('should render "Pull Request required" checkbox', async () => {
    renderPanel();

    const checkbox = await screen.findByRole('checkbox', { name: /pull request required/i });
    expect(checkbox).toBeInTheDocument();
  });

  test.each`
    placeholder
    ${PLACEHOLDERS.sourceGithubRepoUrl}
    ${PLACEHOLDERS.githubRepoName}
  `('should render field with $placeholder placeholder', async ({ placeholder }) => {
    renderPanel();

    const field = await screen.findByPlaceholderText(placeholder);
    expect(field).toBeInTheDocument();
  });

  test('should render error message on invalid source GitHub repo URL input', async () => {
    renderPanel();

    const field = await screen.findByPlaceholderText(PLACEHOLDERS.sourceGithubRepoUrl);
    expect(field).toBeInTheDocument();

    fireEvent.change(field, { target: { value: 'http://github.com/i-vasilich-i' } });

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.sourceGithubRepoUrl);
  });

  test('should not render error message on valid source GitHub repo URL input', async () => {
    renderPanel();

    const field = await screen.findByPlaceholderText(PLACEHOLDERS.sourceGithubRepoUrl);
    expect(field).toBeInTheDocument();

    fireEvent.change(field, { target: { value: 'https://github.com/rolling-scopes-school/task1' } });

    await waitFor(() => {
      const errorMessage = screen.queryByText(ERROR_MESSAGES.sourceGithubRepoUrl);
      expect(errorMessage).not.toBeInTheDocument();
    });
  });
});
