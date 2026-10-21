import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CourseDto } from '@client/api';
import { LABELS, PLACEHOLDERS } from '@client/modules/Registry/constants';
import { CourseDetails } from './CourseDetails';

const renderCourseDetails = (courses: CourseDto[] = []) =>
  render(
    <Form initialValues={courses.length ? { courseId: courses[0]?.id } : undefined}>
      <CourseDetails courses={courses} />
    </Form>,
  );

describe('CourseDetail', () => {
  test('should render field labels and placeholders', async () => {
    renderCourseDetails();

    expect(await screen.findByLabelText(LABELS.course)).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.languagesStudent)).toBeInTheDocument();
    expect(screen.getByText(PLACEHOLDERS.courses)).toBeInTheDocument();
    expect(screen.getByText(PLACEHOLDERS.languages)).toBeInTheDocument();
  });
});
