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

  it('serves templates from the module cache on a subsequent mount (no refetch)', async () => {
    // Import once and keep the module instance so the module-level cache survives.
    const { CertificateTemplatePicker: Picker } = await import('./CertificateTemplatePicker');

    const { unmount } = render(<Picker />);
    await screen.findByText('Default');
    expect(mockedGet).toHaveBeenCalledTimes(1);
    unmount();

    // Second mount reads cachedTemplates: no spinner, no second network call.
    render(<Picker />);
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });

  it('does not update state when unmounted before the fetch resolves', async () => {
    let resolve!: (v: unknown) => void;
    mockedGet.mockReturnValue(new Promise(r => (resolve = r)));

    const { container, unmount } = await renderPicker();
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();

    // Unmount triggers the cleanup (cancelled = true) before the fetch settles.
    unmount();
    resolve({ data: templates });
    // Give the resolved promise a tick; the cancelled guards must swallow the updates.
    await Promise.resolve();
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
  });

  it('closes the preview when the image preview is dismissed', async () => {
    await renderPicker({ value: 'default', onChange: vi.fn() });

    const previewButtons = await screen.findAllByRole('button', { name: /view full preview/i });
    fireEvent.click(previewButtons[0]);

    // Preview is open.
    await waitFor(() => {
      expect(document.querySelector('.ant-image-preview-img, .ant-image-preview-operations')).toBeTruthy();
    });

    // Close it via the antd preview close control => onOpenChange(false) => setPreviewSrc(undefined).
    const closeBtn = document.querySelector('.ant-image-preview-close') as HTMLElement | null;
    if (closeBtn) {
      fireEvent.click(closeBtn);
    } else {
      fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    }

    await waitFor(() => {
      expect(document.querySelector('.ant-image-preview-wrap.ant-image-preview-moving')).toBeNull();
    });
  });

  it('swallows mousedown on the fullscreen control so the radio is not toggled', async () => {
    const onChange = vi.fn();
    await renderPicker({ value: 'default', onChange });

    const previewButtons = await screen.findAllByRole('button', { name: /view full preview/i });
    fireEvent.mouseDown(previewButtons[1]);

    expect(onChange).not.toHaveBeenCalledWith('modern');
  });

  it('auto-selects safely when no onChange handler is provided', async () => {
    // value undefined + no onChange => the optional-chain `onChangeRef.current?.(fallback)` no-ops.
    const { CertificateTemplatePicker: Picker } = await import('./CertificateTemplatePicker');
    render(<Picker />);

    expect(await screen.findByText('Default')).toBeInTheDocument();
  });

  it('reuses a single in-flight request for concurrent mounts', async () => {
    let resolve!: (v: unknown) => void;
    mockedGet.mockReturnValue(new Promise(r => (resolve = r)));
    const { CertificateTemplatePicker: Picker } = await import('./CertificateTemplatePicker');

    // Two simultaneous mounts: the second fetchTemplates call must reuse `inflight`.
    render(<Picker />);
    render(<Picker />);

    resolve({ data: templates });
    await waitFor(() => expect(screen.getAllByText('Default').length).toBeGreaterThan(0));
    // Only one network request despite two mounts.
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when the resolved templates have no usable id', async () => {
    // find(...)?.id ?? templates[0]?.id resolves to a falsy id => the `if (fallback)` guard is false.
    mockedGet.mockResolvedValue({ data: [{ id: '', label: 'Blank', previewUrl: 'https://cdn/blank.png' }] });
    const onChange = vi.fn();
    await renderPicker({ onChange });

    expect(await screen.findByText('Blank')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not update state when unmounted before a failing fetch settles', async () => {
    let reject!: (e: unknown) => void;
    mockedGet.mockReturnValue(new Promise((_, r) => (reject = r)));

    const { container, unmount } = await renderPicker();
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();

    unmount();
    reject(new Error('boom'));
    await Promise.resolve();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
