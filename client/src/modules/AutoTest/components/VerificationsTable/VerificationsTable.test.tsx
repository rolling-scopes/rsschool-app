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
});
