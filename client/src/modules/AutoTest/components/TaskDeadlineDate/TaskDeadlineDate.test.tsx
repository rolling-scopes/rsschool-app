import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { TaskDeadlineDate, TaskDeadlineDateProps } from '..';

describe('TaskDeadlineDate', () => {
  it.each`
    type           | when                        | daysCount
    ${'secondary'} | ${'end date is not passed'} | ${9}
    ${'warning'}   | ${'end date is soon'}       | ${4}
    ${'danger'}    | ${'end date passed'}        | ${1}
  `('should render date as "$type" when $when', ({ type, daysCount }: { type: string; daysCount: number }) => {
    const date = moment();
    const startDate = date.subtract(2, 'd');
    const endDate = date.add(daysCount, 'd');
    const props: TaskDeadlineDateProps = {
      startDate: startDate.format(),
      endDate: endDate.format(),
      score: 0,
    };
    render(<TaskDeadlineDate {...props} />);

    expect(screen.getByText(new RegExp(endDate.format('MMM DD'), 'i'))).toHaveClass(`ant-typography-${type}`);
  });
});
