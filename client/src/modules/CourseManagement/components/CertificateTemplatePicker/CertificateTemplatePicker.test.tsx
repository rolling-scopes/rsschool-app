/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { CertificateTemplatePicker } from './CertificateTemplatePicker';

// The component fetches templates with `axios.get`. The project ships a manual
// axios mock at src/__mocks__/axios.js exposing vi.fn()-based methods.
vi.mock('axios');

const mockedGet = vi.mocked(axios.get);

const templates = [
  { id: 'default', label: 'Default', previewUrl: 'https://cdn/default.png' },
  { id: 'modern', label: 'Modern', previewUrl: 'https://cdn/modern.png' },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedGet.mockResolvedValue({ data: templates });
});

afterEach(() => {
  // The component memoises templates at module scope (cachedTemplates). Reset it
  // between tests via the module registry so each test starts from a clean fetch.
  vi.resetModules();
});

async function renderPicker(props: Parameters<typeof CertificateTemplatePicker>[0] = {}) {
  // Re-import after resetModules so the module-level cache is fresh.
  const { CertificateTemplatePicker: Picker } = await import('./CertificateTemplatePicker');
  return render(<Picker {...props} />);
}

describe('<CertificateTemplatePicker />', () => {
  it('shows a spinner while templates are loading', async () => {
    let resolve!: (v: unknown) => void;
    mockedGet.mockReturnValue(new Promise(r => (resolve = r)));

    const { container } = await renderPicker();

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();

    resolve({ data: templates });
    expect(await screen.findByText('Default')).toBeInTheDocument();
  });

  it('fetches templates from the certificate templates endpoint', async () => {
    await renderPicker();

    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/api/v2/certificate/templates'));
  });

  it('renders one radio per fetched template', async () => {
    await renderPicker();

    expect(await screen.findByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Modern')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('auto-selects the default template when value is undefined', async () => {
    const onChange = vi.fn();
    await renderPicker({ onChange });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('default'));
  });

  it('falls back to the first template when no template has id "default"', async () => {
    mockedGet.mockResolvedValue({
      data: [
        { id: 'modern', label: 'Modern', previewUrl: 'https://cdn/modern.png' },
        { id: 'classic', label: 'Classic', previewUrl: 'https://cdn/classic.png' },
      ],
    });
    const onChange = vi.fn();
    await renderPicker({ onChange });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('modern'));
  });

  it('emits onChange with the chosen template id when a radio is clicked', async () => {
    const onChange = vi.fn();
    await renderPicker({ value: 'default', onChange });

    const modernRadio = await screen.findByRole('radio', { name: /modern/i });
    fireEvent.click(modernRadio);

    expect(onChange).toHaveBeenCalledWith('modern');
  });

  it('opens the full preview without toggling the radio selection', async () => {
    const onChange = vi.fn();
    await renderPicker({ value: 'default', onChange });

    // The fullscreen control for the "Modern" (non-selected) card. Clicking it must
    // open the preview (state) and NOT change the radio selection — openPreview calls
    // preventDefault/stopPropagation to swallow the surrounding Radio's toggle.
    const previewButtons = await screen.findAllByRole('button', { name: /view full preview/i });
    fireEvent.click(previewButtons[1]);

    // Selection onChange must NOT fire to 'modern' from the preview click.
    expect(onChange).not.toHaveBeenCalledWith('modern');
    // The hidden antd Image is now driven open (its preview mask becomes present).
    await waitFor(() => {
      expect(document.querySelector('.ant-image-preview-operations, .ant-image-preview-img')).toBeTruthy();
    });
  });

  it('renders an empty radio group when the fetch fails', async () => {
    mockedGet.mockRejectedValue(new Error('boom'));
    await renderPicker();

    await waitFor(() => expect(screen.queryByRole('radio')).not.toBeInTheDocument());
  });
});
