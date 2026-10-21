import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CARD_TITLES } from '@client/modules/Registry/constants';
import { MentorshipSection } from './MentorshipSection';

const renderMentorshipSection = () => {
  render(
    <Form>
      <MentorshipSection courses={[]} disciplines={[]} onPrevious={vi.fn()} />
    </Form>,
  );
};

describe('MentorshipSection', () => {
  test('should render discipline, preference and additional information cards', () => {
    renderMentorshipSection();

    const titles = [CARD_TITLES.disciplines, CARD_TITLES.preferences, CARD_TITLES.additionalInfo];
    titles.forEach(title => expect(screen.getByRole('heading', { name: title })).toBeInTheDocument());
  });
});
