import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CARD_TITLES } from 'modules/Registry/constants';
import { MentorshipSection } from './MentorshipSection';

const renderMentorshipSection = () => {
  render(
    <Form>
      <MentorshipSection courses={[]} disciplines={[]} onPrevious={jest.fn()} />
    </Form>,
  );
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
