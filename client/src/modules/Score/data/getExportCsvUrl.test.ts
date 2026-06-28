import { getExportCsvUrl } from './getExportCsvUrl';

describe('getExportCsvUrl', () => {
  it('builds the bare CSV export url when no filters are supplied', () => {
    expect(getExportCsvUrl(42)).toBe('/api/v2/course/42/students/score/csv');
  });

  it('appends the city and mentor query params when provided', () => {
    const url = getExportCsvUrl(7, 'Minsk', 'mentor1');
    expect(url).toContain('/api/v2/course/7/students/score/csv?');
    expect(url).toContain('cityName=Minsk');
    expect(url).toContain('mentor.githubId=mentor1');
  });

  it('joins array-valued city filters into a comma-separated param', () => {
    const url = getExportCsvUrl(7, ['Minsk', 'Grodno']);
    expect(url).toContain('cityName=Minsk%2CGrodno');
  });
});
