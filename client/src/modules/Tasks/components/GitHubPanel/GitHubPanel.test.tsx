import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from '@client/modules/Tasks/constants';
import { GitHubPanel } from './GitHubPanel';

const renderPanel = () => {
  render(
    <Form>
      <GitHubPanel />
    </Form>,
  );
};

describe('GitHub', () => {
  test('renders its fields and validates the source repository URL', async () => {
    renderPanel();

    expect(await screen.findByText(LABELS.repoUrl)).toBeInTheDocument();
    expect(screen.getByText(LABELS.expectedRepoName)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /pull request required/i })).toBeInTheDocument();
    const field = await screen.findByPlaceholderText(PLACEHOLDERS.sourceGithubRepoUrl);
    expect(screen.getByPlaceholderText(PLACEHOLDERS.githubRepoName)).toBeInTheDocument();

    fireEvent.change(field, { target: { value: 'http://github.com/i-vasilich-i' } });
    const errorMessage = await screen.findByText(ERROR_MESSAGES.sourceGithubRepoUrl);
    expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.sourceGithubRepoUrl);

    fireEvent.change(field, { target: { value: 'https://github.com/rolling-scopes-school/task1' } });
    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGES.sourceGithubRepoUrl)).not.toBeInTheDocument());
  });
});
