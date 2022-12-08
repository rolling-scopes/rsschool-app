import { render, screen } from '@testing-library/react';
import { RegistrationNotice } from './RegistrationNotice';

describe('RegistrationNotice', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => jest.useRealTimers());

  it('should not render component if registration not yet started', () => {
    render(<RegistrationNotice name="test course" showMentorOptions={jest.fn()} startDate="2023-02-01" />);

    expect(screen.queryByText('test course')).not.toBeInTheDocument();
  });

  it('should render component if registration in progress', () => {
    render(<RegistrationNotice name="test course" showMentorOptions={jest.fn()} startDate="2023-01-02" />);

    expect(screen.getByText('test course', { exact: false })).toBeInTheDocument();
  });
});
