import { UploadCriteriaJSON } from '../UploadCriteriaJSON';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const onLoad = vi.fn();

describe('UploadCriteriaJSON', () => {
  test('renders the upload control and accepts a JSON file', async () => {
    render(<UploadCriteriaJSON onLoad={onLoad} />);
    const element = screen.getByText('Click to Upload Criteria (JSON)');
    expect(element).toBeInTheDocument();
    global.URL.createObjectURL = vi.fn();

    const file = new File(['{test: 1}'], 'test.json', { type: 'application/json' });
    const input = screen.getByTestId('uploader') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(input.files).toHaveLength(1));
  });
});
