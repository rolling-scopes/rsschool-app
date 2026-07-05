import { render, screen } from '@testing-library/react';
import { StudentInfo } from './StudentInfo';
import { StudentDto } from '@client/api';

function makeStudent(overrides: Partial<StudentDto> = {}): StudentDto {
  return {
    githubId: 'ada-lovelace',
    name: 'Ada Lovelace',
    rank: 3,
    totalScore: 850,
    cityName: 'London',
    countryName: 'UK',
    ...overrides,
  } as StudentDto;
}

const courseSummary = { totalScore: 1000, studentsCount: 50 };

describe('<StudentInfo />', () => {
  it('renders the student name, github link, rank/position, score and location', () => {
    render(<StudentInfo student={makeStudent()} courseSummary={courseSummary} />);

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /ada-lovelace/ });
    expect(link).toHaveAttribute('href', 'https://github.com/ada-lovelace');
    expect(link).toHaveAttribute('target', '_blank');

    expect(screen.getByText('3/50')).toBeInTheDocument();
    expect(screen.getByText('850/1000')).toBeInTheDocument();
    expect(screen.getByText('London, UK')).toBeInTheDocument();
  });

  it('omits the name heading when the name is empty or the placeholder "(Empty)"', () => {
    const { rerender } = render(
      <StudentInfo student={makeStudent({ name: '(Empty)' })} courseSummary={courseSummary} />,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    // Github link is still present.
    expect(screen.getByRole('link', { name: /ada-lovelace/ })).toBeInTheDocument();

    rerender(<StudentInfo student={makeStudent({ name: '' })} courseSummary={courseSummary} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('joins only the populated location parts (city missing → country only)', () => {
    render(
      <StudentInfo
        student={makeStudent({ cityName: undefined, countryName: 'Poland' })}
        courseSummary={courseSummary}
      />,
    );
    expect(screen.getByText('Poland')).toBeInTheDocument();
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it('renders an empty location string when neither city nor country is set', () => {
    render(
      <StudentInfo
        student={makeStudent({ cityName: undefined, countryName: undefined })}
        courseSummary={courseSummary}
      />,
    );
    // Position + Total Score labels still render.
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Total Score')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });
});
