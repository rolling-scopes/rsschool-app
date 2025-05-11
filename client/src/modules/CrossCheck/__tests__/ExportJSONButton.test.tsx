import { render, screen } from '@testing-library/react';
import { CriteriaDto, CriteriaDtoTypeEnum } from 'api';
import { ExportJSONButton } from '../ExportJSONButton';

const dataCriteria = [
  {
    key: '0',
    index: 0,
    type: CriteriaDtoTypeEnum.Title,
    text: 'Its title',
  },
  {
    key: '1',
    index: 1,
    type: CriteriaDtoTypeEnum.Subtask,
    text: 'Its subtask',
    max: 10,
  },
  {
    key: '2',
    index: 2,
    type: CriteriaDtoTypeEnum.Penalty,
    text: 'Its penalty',
    max: -5,
  },
] as CriteriaDto[];

describe('ExportJSONButton', () => {
  test('contains following text', () => {
    render(<ExportJSONButton dataCriteria={dataCriteria} />);
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
  });

  test('should render correctly with empty dataCriteria', () => {
    render(<ExportJSONButton dataCriteria={[]} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('download', 'crossCheckCriteria.json');
  });
});
