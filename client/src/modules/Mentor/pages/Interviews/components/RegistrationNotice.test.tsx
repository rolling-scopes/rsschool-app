import { render, screen } from '@testing-library/react';
import { RegistrationNotice } from './RegistrationNotice';

describe('RegistrationNotice', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => jest.useRealTimers());

  const interview = {
    id: 1,
    startDate: '',
    endDate: '',
    description: '',
    name: 'test course',
    type: 'stage-interview',
    descriptionUrl: '',
    attributes: {},
  };

  it('should not render component if registration not yet started', () => {
    render(<RegistrationNotice interview={interview} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should not render component if interview is not of stage type', () => {
    render(<RegistrationNotice interview={{ ...interview, type: 'interview' }} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should render component if registration in progress', () => {
    render(<RegistrationNotice interview={interview} startDate="2023-01-02" />);

    expect(screen.getByText('test course', { exact: false })).toBeInTheDocument();
  });
});
