import { CourseEvent } from 'services/course';

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

export function ListView({ data, timeZone }: Props) {
  return (
    <div>
      <h2>List</h2>
      Data length = {data.length}. Timezone = {timeZone}
    </div>
  );
}

export default ListView;
