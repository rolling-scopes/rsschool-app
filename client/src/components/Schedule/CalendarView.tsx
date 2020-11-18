import { CourseEvent } from 'services/course';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

export function CalendarView({ data, timeZone }: Props) {
  return (
    <div>
      <h2>Calendar</h2>
      Data length = {data.length}. Timezone = {timeZone}
    </div>
  );
}

export default CalendarView;
