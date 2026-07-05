import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { AxiosError } from 'axios';
import { OpportunitiesApi, ResumeDto } from '@client/api';
import { EditPage } from './index';

// --- Boundary mocks --------------------------------------------------------

vi.mock('@client/api');

// Session provides the githubId used to fetch the resume.
vi.mock('@client/modules/Course/contexts', async () => {
  const { createContext } = await vi.importActual<typeof import('react')>('react');
  return { SessionContext: createContext({ githubId: 'tester' }) };
});

// EditViewCv is the heavy editor/viewer child (forms + CV view). Replace it with a marker
// that surfaces the consent/editMode/data props and the wiring callbacks so the page's
// consent/data flows can be driven and asserted without the real subtree.
vi.mock('@client/modules/Opportunities/components/EditViewCv', () => ({
  EditViewCv: (props: {
    consent: boolean;
    editMode: boolean;
    data: ResumeDto | null;
    onRemoveConsent: () => Promise<unknown>;
    onCreateConsent: () => Promise<unknown>;
    onUpdateResume: () => void;
  }) => (
    <div
      data-testid="edit-view-cv"
      data-consent={String(props.consent)}
      data-edit-mode={String(props.editMode)}
      data-has-data={String(props.data != null)}
    >
      <button type="button" onClick={() => props.onRemoveConsent()}>
        remove-consent
      </button>
      <button type="button" onClick={() => props.onCreateConsent()}>
        create-consent
      </button>
      <button type="button" onClick={() => props.onUpdateResume()}>
        update-resume
      </button>
    </div>
  ),
}));

const getConsent = vi.mocked(OpportunitiesApi.prototype.getConsent);
const getResume = vi.mocked(OpportunitiesApi.prototype.getResume);
const createConsent = vi.mocked(OpportunitiesApi.prototype.createConsent);
const deleteConsent = vi.mocked(OpportunitiesApi.prototype.deleteConsent);

const resume = { githubUsername: 'tester', name: 'Test User' } as ResumeDto;

beforeEach(() => {
  vi.clearAllMocks();
  getConsent.mockResolvedValue({ data: { consent: true } } as never);
  getResume.mockResolvedValue({ data: resume } as never);
  createConsent.mockResolvedValue({ data: { expires: Date.now() } } as never);
  deleteConsent.mockResolvedValue({ data: {} } as never);
});

describe('<EditPage />', () => {
  it('fetches consent and the resume on mount and passes them to the editor', async () => {
    render(<EditPage />);

    await waitFor(() => expect(getConsent).toHaveBeenCalled());
    await waitFor(() => expect(getResume).toHaveBeenCalledWith('tester'));

    const view = await screen.findByTestId('edit-view-cv');
    expect(view).toHaveAttribute('data-consent', 'true');
    expect(view).toHaveAttribute('data-has-data', 'true');
  });

  it('does not request the resume when the user has not consented', async () => {
    getConsent.mockResolvedValue({ data: { consent: false } } as never);
    render(<EditPage />);

    await waitFor(() => expect(getConsent).toHaveBeenCalled());
    expect(getResume).not.toHaveBeenCalled();
    expect(await screen.findByTestId('edit-view-cv')).toHaveAttribute('data-consent', 'false');
  });

  it('treats a 404 resume response as "no CV yet" (null data, edit mode)', async () => {
    getResume.mockRejectedValue({ response: { status: 404 } } as AxiosError);
    render(<EditPage />);

    const view = await screen.findByTestId('edit-view-cv');
    await waitFor(() => expect(view).toHaveAttribute('data-has-data', 'false'));
    // editMode falls back to true when there is no resume.
    expect(view).toHaveAttribute('data-edit-mode', 'true');
  });

  it('surfaces a non-404 resume error through the loading error handler', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getResume.mockRejectedValue({ response: { status: 500 } } as AxiosError);

    render(<EditPage />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });

  it('creates consent, shows the public-until modal and refetches data', async () => {
    const user = userEvent.setup();
    render(<EditPage />);

    await user.click(await screen.findByRole('button', { name: 'create-consent' }));

    await waitFor(() => expect(createConsent).toHaveBeenCalled());
    // getData runs again after creating consent and after the editMode flip it sets.
    await waitFor(() => expect(getConsent.mock.calls.length).toBeGreaterThanOrEqual(2));
    // The "now public until" info modal is shown (antd splits the title text across nodes).
    expect((await screen.findAllByText(/Your CV is now public until/i)).length).toBeGreaterThan(0);
  });

  it('deletes consent and refetches data', async () => {
    const user = userEvent.setup();
    render(<EditPage />);

    await user.click(await screen.findByRole('button', { name: 'remove-consent' }));

    await waitFor(() => expect(deleteConsent).toHaveBeenCalled());
    await waitFor(() => expect(getConsent).toHaveBeenCalledTimes(2));
  });

  it('refetches the resume when the editor requests an update', async () => {
    const user = userEvent.setup();
    render(<EditPage />);

    await screen.findByTestId('edit-view-cv');
    await user.click(screen.getByRole('button', { name: 'update-resume' }));

    await waitFor(() => expect(getConsent).toHaveBeenCalledTimes(2));
  });
});
