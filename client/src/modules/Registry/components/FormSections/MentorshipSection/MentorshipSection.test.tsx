import { render, screen } from '@testing-library/react';
import { CARD_TITLES } from 'modules/Registry/constants';
import { MentorshipSection } from './MentorshipSection';

const renderMentorshipSection = () => {
  render(<MentorshipSection courses={[]} checkedList={[]} disciplines={[]} onPrevious={jest.fn()} />);
};

describe('MentorshipSection', () => {
  test.each`
    title
    ${CARD_TITLES.disciplines}
    ${CARD_TITLES.preferences}
    ${CARD_TITLES.additionalInfo}
  `('should render card with $title title', async ({ title }) => {
    renderMentorshipSection();

    const card = await screen.findByRole('heading', { name: title });
    expect(card).toBeInTheDocument();
  });
});
