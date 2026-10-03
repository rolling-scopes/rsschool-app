import { render, screen, within } from '@testing-library/react';
import dayjs from 'dayjs';
import { TaskDeadlineDate, TaskDeadlineDateProps } from '..';
import { CourseTaskState } from '@client/modules/AutoTest/types';

describe('TaskDeadlineDate', () => {
  it('renders future and missed deadlines with the expected emphasis', () => {
    const date = dayjs();
    const startDate = date.subtract(2, 'd').format();
    const cases = [
      { state: CourseTaskState.Uncompleted, endDate: date.add(9, 'd'), type: 'secondary' },
      { state: CourseTaskState.Completed, endDate: date.add(9, 'd'), type: 'secondary' },
      { state: CourseTaskState.Missed, endDate: date.add(1, 'd'), type: 'danger' },
    ];

    render(
      <>
        {cases.map(({ state, endDate }, index) => {
          const props: TaskDeadlineDateProps = { startDate, endDate: endDate.format(), state };
          return (
            <div key={state} data-testid={`deadline-${index}`}>
              <TaskDeadlineDate {...props} />
            </div>
          );
        })}
      </>,
    );

    cases.forEach(({ endDate, type }, index) => {
      expect(
        within(screen.getByTestId(`deadline-${index}`)).getByText(new RegExp(endDate.format('MMM DD'), 'i')),
      ).toHaveClass(`ant-typography-${type}`);
    });
  });
});
