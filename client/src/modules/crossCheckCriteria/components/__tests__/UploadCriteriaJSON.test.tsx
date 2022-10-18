import React from 'react';
import { UploadCriteriaJSON } from '../UploadCriteriaJSON';
import { fireEvent, render, screen } from '@testing-library/react';

const onLoad = jest.fn();

describe('UploadCriteriaJSON', () => {
  test('contains following element', () => {
    render(<UploadCriteriaJSON onLoad={onLoad} />);
    const element = screen.getByText('Click to Upload Criteria (JSON)');
    expect(element).toBeInTheDocument();
  });

  test('upload file', () => {
    render(<UploadCriteriaJSON onLoad={onLoad} />);
    global.URL.createObjectURL = jest.fn();

    const file = new File(["{test: 1}"], "test.json", {type: 'application/json'})
    const input = screen.getByTestId("uploader") as HTMLInputElement;

    fireEvent.change(input, {target: {files: [file]}});
    expect(input.files).toHaveLength(1)
  });

});
