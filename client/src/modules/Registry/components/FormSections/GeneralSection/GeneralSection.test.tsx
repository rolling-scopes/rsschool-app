import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CourseDto } from '@client/api';
import { CARD_TITLES } from '@client/modules/Registry/constants';
import { GeneralSection } from './GeneralSection';
import usePlacesAutocomplete from 'use-places-autocomplete';

vi.mock('use-places-autocomplete');

vi.mocked(usePlacesAutocomplete).mockImplementation(() => ({
  value: null,
  suggestions: {
    data: {
      map: vi.fn(),
    },
    loading: false,
  },
  setValue: vi.fn(),
}));

const renderGeneralSection = (courses?: CourseDto[]) => {
  render(
    <Form>
      <GeneralSection location={null} setLocation={vi.fn()} courses={courses} />
    </Form>,
  );
};

describe('GeneralSection', () => {
  test('renders personal and contact cards without course details on the mentor form', () => {
    renderGeneralSection();

    expect(screen.getByRole('heading', { name: CARD_TITLES.personalInfo })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: CARD_TITLES.contactInfo })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: CARD_TITLES.courseDetails })).not.toBeInTheDocument();
  });

  test('renders course and personal cards without contact information on the student form', () => {
    renderGeneralSection([]);

    expect(screen.getByRole('heading', { name: CARD_TITLES.courseDetails })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: CARD_TITLES.personalInfo })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: CARD_TITLES.contactInfo })).not.toBeInTheDocument();
  });
});
