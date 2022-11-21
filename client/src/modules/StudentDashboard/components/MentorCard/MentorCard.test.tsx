import { fireEvent, render, screen } from '@testing-library/react';
import { MentorCardProps, MentorCard, ASSERTION } from '.';

const MENTOR_MOCK = {
  id: 1,
  githubId: 'github-id',
  name: 'mentor-name',
  isActive: true,
  cityName: 'city-name',
  countryName: 'country-name',
  students: [],
  contactsEmail: 'email@example.com',
  contactsNotes: 'contact-notes',
  contactsPhone: 'contact-phone',
  contactsSkype: 'contact-skype',
  contactsTelegram: 'contact-telegram',
};
const PROPS_MOCK: MentorCardProps = {
  mentor: MENTOR_MOCK,
  courseId: 10,
};

describe('MentorCard', () => {
  describe('when student has a mentor', () => {
    it.each`
      info
      ${MENTOR_MOCK.githubId}
      ${MENTOR_MOCK.name}
      ${MENTOR_MOCK.cityName}
      ${MENTOR_MOCK.countryName}
      ${MENTOR_MOCK.contactsEmail}
      ${MENTOR_MOCK.contactsNotes}
      ${MENTOR_MOCK.contactsPhone}
      ${MENTOR_MOCK.contactsSkype}
      ${MENTOR_MOCK.contactsTelegram}
    `('should render mentor info "$info"', ({ info }: { info: string }) => {
      render(<MentorCard {...PROPS_MOCK} />);

      expect(screen.getByText(new RegExp(info))).toBeInTheDocument();
    });
  });

  describe('when student does not have a mentor', () => {
    const propsWithoutMentor = { ...PROPS_MOCK, mentor: undefined };

    it('should not render mentor data', () => {
      render(<MentorCard {...propsWithoutMentor} />);

      expect(screen.queryByText(MENTOR_MOCK.githubId)).not.toBeInTheDocument();
    });

    it('should render note', () => {
      render(<MentorCard {...propsWithoutMentor} />);

      expect(screen.getByText(ASSERTION)).toBeInTheDocument();
    });
  });

  it('should render Submit task button', () => {
    render(<MentorCard {...PROPS_MOCK} />);

    const submitButton = screen.getByRole('button', { name: /submit task/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should open modal window when Submit task was clicked', async () => {
    render(<MentorCard {...PROPS_MOCK} />);

    const submitButton = screen.getByRole('button', { name: /submit task/i });
    fireEvent.click(submitButton);

    const modalTitle = await screen.findByRole('dialog', { name: /submit task for mentor review/i });
    expect(modalTitle).toBeInTheDocument();
  });
});
