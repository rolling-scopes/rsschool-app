import { render, screen } from '@testing-library/react';
import moment from 'moment';
import { TaskDeadlineDate, TaskDeadlineDateProps } from '..';
import { CourseTaskState } from '../../types';

describe('TaskDeadlineDate', () => {
  it.each`
    type           | when                        | state                          | daysCount
    ${'secondary'} | ${'end date is not passed'} | ${CourseTaskState.Uncompleted} | ${9}
    ${'secondary'} | ${'end date is not passed'} | ${CourseTaskState.Completed}   | ${9}
    ${'danger'}    | ${'end date passed'}        | ${CourseTaskState.Missed}      | ${1}
  `(
    'should render date as "$type" when $when',
    ({ type, state, daysCount }: { type: string; state: CourseTaskState; daysCount: number }) => {
      const date = moment();
      const startDate = date.subtract(2, 'd');
      const endDate = date.add(daysCount, 'd');
      const props: TaskDeadlineDateProps = {
        startDate: startDate.format(),
        endDate: endDate.format(),
        state,
      };
      render(<TaskDeadlineDate {...props} />);

      expect(screen.getByText(new RegExp(endDate.format('MMM DD'), 'i'))).toHaveClass(`ant-typography-${type}`);
    },
  );
});
