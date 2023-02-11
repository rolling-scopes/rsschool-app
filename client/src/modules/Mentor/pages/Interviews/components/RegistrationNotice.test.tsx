import { render, screen } from '@testing-library/react';
import { InterviewDto } from 'api';
import { RegistrationNoticeAlert } from './RegistrationNoticeAlert';

describe('RegistrationNoticeAlert', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => jest.useRealTimers());

  const interview: InterviewDto = {
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
    render(<RegistrationNoticeAlert interview={interview} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should not render component if interview is not of stage type', () => {
    render(<RegistrationNoticeAlert interview={{ ...interview, type: 'interview' }} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should render component if registration in progress', () => {
    render(<RegistrationNoticeAlert interview={interview} startDate="2023-01-02" />);

    expect(screen.getByText('test course', { exact: false })).toBeInTheDocument();
  });
});
