import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CourseDto } from '@client/api';
import { CARD_TITLES } from 'modules/Registry/constants';
import { GeneralSection } from './GeneralSection';
import usePlacesAutocomplete from 'use-places-autocomplete';

jest.mock('use-places-autocomplete');

(usePlacesAutocomplete as jest.Mock).mockImplementation(() => ({
  value: null,
  suggestions: {
    data: {
      map: jest.fn(),
    },
    loading: false,
  },
  setValue: jest.fn(),
}));

const renderGeneralSection = (courses?: CourseDto[]) => {
  render(
    <Form>
      <GeneralSection location={null} setLocation={jest.fn()} courses={courses} />
    </Form>,
  );
};

describe('GeneralSection', () => {
  test.each`
    title
    ${CARD_TITLES.personalInfo}
    ${CARD_TITLES.contactInfo}
  `('should render mentor form card with $title title', async ({ title }) => {
    renderGeneralSection();

    const card = await screen.findByRole('heading', { name: title });
    expect(card).toBeInTheDocument();
  });

  test('should not render CourseDetails card on mentor form', async () => {
    renderGeneralSection();

    const card = screen.queryByRole('heading', { name: CARD_TITLES.courseDetails });
    expect(card).not.toBeInTheDocument();
  });

  test.each`
    title
    ${CARD_TITLES.courseDetails}
    ${CARD_TITLES.personalInfo}
  `('should render student form card with $title title', async ({ title }) => {
    renderGeneralSection([]);

    const card = await screen.findByRole('heading', { name: title });
    expect(card).toBeInTheDocument();
  });

  test('should not render ContactInfo card on student form', async () => {
    renderGeneralSection([]);

    const card = screen.queryByRole('heading', { name: CARD_TITLES.contactInfo });
    expect(card).not.toBeInTheDocument();
  });
});
