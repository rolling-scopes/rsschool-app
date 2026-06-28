import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Form } from 'antd';
import JupyterNotebook from './JupyterNotebook';

// --- Brittle-widget policy -------------------------------------------------
// antd Upload wires up file selection that is unusable in jsdom for driving the
// onChange branch. Stub it to expose `onChange` via a button so the test can fire
// a controlled UploadChangeParam and assert the resulting file list / validation.
let capturedOnChange: NonNullable<UploadProps['onChange']> | undefined;
let capturedFileList: UploadFile[] | undefined;
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  const Upload = (props: UploadProps & { children?: React.ReactNode }) => {
    capturedOnChange = props.onChange;
    capturedFileList = props.fileList;
    return <div data-testid="upload-stub">{props.children}</div>;
  };
  return { ...actual, Upload };
});

function renderJupyterNotebook(onFinish = vi.fn()) {
  return render(
    <Form onFinish={onFinish}>
      <JupyterNotebook />
      <Button htmlType="submit">Submit</Button>
    </Form>,
  );
}

describe('JupyterNotebook', () => {
  beforeEach(() => {
    capturedOnChange = undefined;
    capturedFileList = undefined;
  });

  it('should render the upload button', () => {
    renderJupyterNotebook();

    expect(screen.getByRole('button', { name: /select jupyter notebook/i })).toBeInTheDocument();
  });

  it('should show the required validation message when submitting without a file', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderJupyterNotebook(onFinish);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please upload the file')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('should add the chosen file to the upload list on change', async () => {
    renderJupyterNotebook();

    const file = { uid: '1', name: 'notebook.ipynb' } as UploadFile;
    // Simulate antd firing onChange with a selected file.
    capturedOnChange?.({ file, fileList: [file] } as Parameters<NonNullable<UploadProps['onChange']>>[0]);

    // The component stores the file and passes it back as the Upload fileList.
    expect(await screen.findByText('Select Jupyter Notebook')).toBeInTheDocument();
    expect(capturedFileList?.[0]?.name).toBe('notebook.ipynb');
  });
});
