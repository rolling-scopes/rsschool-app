import { render, screen } from '@testing-library/react';
import type { UploadProps } from 'antd';
import { UploadCriteriaJSON } from './UploadCriteriaJSON';

// --- Brittle-widget policy -------------------------------------------------
// antd Upload wires up file selection / drag-drop that is unusable in jsdom for
// driving the parse branch. Stub it to expose `onChange` via a button so the
// test can fire controlled UploadChangeParam payloads. FileReader is stubbed
// below so we feed the parser controlled JSON text and assert the result.
let capturedOnChange: NonNullable<UploadProps['onChange']> | undefined;
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  const Upload = (props: UploadProps & { children?: React.ReactNode }) => {
    capturedOnChange = props.onChange;
    return <div data-testid="upload-stub">{props.children}</div>;
  };
  return { ...actual, Upload };
});

// Controllable FileReader. The component assigns `onload` *after* calling
// readAsText, so defer the callback to a microtask to mirror real async reads.
// Errors thrown by onload (e.g. JSON.parse on bad input) are captured rather than
// surfaced as unhandled rejections so tests can assert the observable effect.
let nextResult = '';
let lastOnloadError: unknown = null;
class MockFileReader {
  onload: ((e: { target: { result: string } }) => void) | null = null;
  readAsText() {
    Promise.resolve().then(() => {
      try {
        this.onload?.({ target: { result: nextResult } });
      } catch (e) {
        lastOnloadError = e;
      }
    });
  }
}

const { warning, success } = vi.hoisted(() => ({ warning: vi.fn(), success: vi.fn() }));
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { warning, success, error: vi.fn(), info: vi.fn() } }),
}));

async function fireUpload(jsonText: string, fileName = 'criteria.json') {
  nextResult = jsonText;
  capturedOnChange?.({
    file: { status: 'done', name: fileName, originFileObj: new Blob([jsonText]) },
  } as never);
  // Flush the deferred FileReader.onload microtask.
  await Promise.resolve();
  await Promise.resolve();
}

beforeAll(() => {
  vi.stubGlobal('FileReader', MockFileReader);
});
afterAll(() => {
  vi.unstubAllGlobals();
});

describe('<UploadCriteriaJSON /> parse branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnChange = undefined;
  });

  it('renders the upload button', () => {
    render(<UploadCriteriaJSON onLoad={vi.fn()} />);
    expect(screen.getByText('Click to Upload Criteria (JSON)')).toBeInTheDocument();
  });

  it('parses a valid criteria file and calls onLoad with the transformed data', async () => {
    const onLoad = vi.fn();
    render(<UploadCriteriaJSON onLoad={onLoad} />);

    await fireUpload(
      JSON.stringify({
        criteria: [
          { type: 'title', title: 'Heading' },
          { type: 'subtask', max: 10, text: 'Do the thing' },
        ],
      }),
    );

    expect(onLoad).toHaveBeenCalledWith([
      // Title rows are transformed: title -> text.
      { type: 'title', text: 'Heading' },
      { type: 'subtask', max: 10, text: 'Do the thing' },
    ]);
    expect(success).toHaveBeenCalledWith('criteria.json file uploaded successfully');
  });

  it('warns and does not call onLoad when the criteria array is empty', async () => {
    const onLoad = vi.fn();
    render(<UploadCriteriaJSON onLoad={onLoad} />);

    await fireUpload(JSON.stringify({ criteria: [] }));

    expect(warning).toHaveBeenCalledWith('There is no criteria for downloading');
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('warns when the JSON has no criteria field at all', async () => {
    const onLoad = vi.fn();
    render(<UploadCriteriaJSON onLoad={onLoad} />);

    await fireUpload(JSON.stringify({ somethingElse: true }));

    expect(warning).toHaveBeenCalledWith('There is no criteria for downloading');
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('does not call onLoad or success on invalid JSON content (parse error branch)', async () => {
    const onLoad = vi.fn();
    lastOnloadError = null;
    render(<UploadCriteriaJSON onLoad={onLoad} />);

    await fireUpload('not-valid-json');

    // JSON.parse threw inside onload (captured by the FileReader mock).
    expect(lastOnloadError).toBeInstanceOf(Error);
    expect(onLoad).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('ignores upload events whose status is not "done"', async () => {
    const onLoad = vi.fn();
    render(<UploadCriteriaJSON onLoad={onLoad} />);

    capturedOnChange?.({
      file: { status: 'uploading', name: 'criteria.json' },
    } as never);
    await Promise.resolve();

    expect(onLoad).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
});
