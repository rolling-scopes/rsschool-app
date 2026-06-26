import { render, screen } from '@testing-library/react';
import { VerificationsTable, VerificationsTableProps } from '..';
import { Verification } from '@client/services/course';

const PROPS_MOCK: VerificationsTableProps = {
  maxScore: 100,
  loading: false,
  verifications: [
    {
      id: 1,
      score: 20,
      createdDate: '2022-12-10T00:00:00.000Z',
      details: 'Your accuracy: 40%.',
    },
  ] as Verification[],
};

describe('VerificationsTable', () => {
  it.each`
    item
    ${'Date / Time'}
    ${'Score / Max'}
    ${'Accuracy'}
    ${'Details'}
    ${'20 / 100'}
    ${'40%'}
    ${'Your accuracy: 40%.'}
  `('should render $item', ({ item }: { item: string }) => {
    render(<VerificationsTable {...PROPS_MOCK} />);

    const element = screen.getByText(item);
    expect(element).toBeInTheDocument();
  });

  it('should render metadata when it was provided', () => {
    const verificationWithMetadata = {
      id: 1,
      score: 20,
      details: 'Accuracy: 30%.',
      metadata: [
        {
          id: '1',
          name: 'Metadata name',
        },
      ] as any,
      courseTask: {
        type: 'codewars',
      },
    } as Verification;
    render(<VerificationsTable {...PROPS_MOCK} verifications={[verificationWithMetadata]} />);

    const metadata = screen.getByText(/Metadata name/i);
    expect(metadata).toBeInTheDocument();
  });

  it('should render codewars metadata as links with completed and incomplete marks', () => {
    const verification = {
      id: 1,
      score: 20,
      details: 'Codewars katas',
      metadata: [
        { id: '1', url: 'https://codewars.com/a', name: 'Kata A', completed: true },
        { id: '2', url: 'https://codewars.com/b', name: 'Kata B', completed: false },
      ] as any,
      courseTask: { type: 'codewars' },
    } as Verification;
    render(<VerificationsTable {...PROPS_MOCK} verifications={[verification]} />);

    const linkA = screen.getByRole('link', { name: /Kata A/i });
    const linkB = screen.getByRole('link', { name: /Kata B/i });
    expect(linkA).toHaveAttribute('href', 'https://codewars.com/a');
    expect(linkB).toHaveAttribute('href', 'https://codewars.com/b');
    expect(linkA).toHaveAttribute('target', '_blank');
  });

  it('should render a dash for accuracy when details have no accuracy value', () => {
    const verification = {
      id: 1,
      score: 20,
      createdDate: '2022-12-10T00:00:00.000Z',
      details: 'No accuracy info here',
    } as Verification;
    render(<VerificationsTable {...PROPS_MOCK} verifications={[verification]} />);

    expect(screen.getByText('–')).toBeInTheDocument();
  });

  it('should split multiline details into separate rows', () => {
    const verification = {
      id: 1,
      score: 20,
      createdDate: '2022-12-10T00:00:00.000Z',
      details: 'first line\\nsecond line',
    } as Verification;
    render(<VerificationsTable {...PROPS_MOCK} verifications={[verification]} />);

    expect(screen.getByText('first line')).toBeInTheDocument();
    expect(screen.getByText('second line')).toBeInTheDocument();
  });
});
