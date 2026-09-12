import { act, render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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

  it('renders, validates, and stores a selected notebook', async () => {
    const user = setupUser();
    const onFinish = vi.fn();
    renderJupyterNotebook(onFinish);

    expect(screen.getByRole('button', { name: /select jupyter notebook/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText('Please upload the file')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();

    const file = { uid: '1', name: 'notebook.ipynb' } as UploadFile;
    await act(async () => {
      capturedOnChange?.({ file, fileList: [file] } as Parameters<NonNullable<UploadProps['onChange']>>[0]);
    });

    expect(await screen.findByText('Select Jupyter Notebook')).toBeInTheDocument();
    expect(capturedFileList?.[0]?.name).toBe('notebook.ipynb');
  });
});
