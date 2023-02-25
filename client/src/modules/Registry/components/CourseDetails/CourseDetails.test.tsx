import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { CourseDto } from 'api';
import { LABELS, PLACEHOLDERS } from 'modules/Registry/constants';
import { CourseDetails } from './CourseDetails';

const renderCourseDetails = (courses: CourseDto[] = []) =>
  render(
    <Form initialValues={courses.length ? { courseId: courses[0].id } : undefined}>
      <CourseDetails courses={courses} />
    </Form>,
  );

describe('CourseDetail', () => {
  test.each`
    label
    ${LABELS.course}
    ${LABELS.languagesStudent}
  `('should render field with $label label', async ({ label }) => {
    renderCourseDetails();

    const fieldLabel = await screen.findByLabelText(label);
    expect(fieldLabel).toBeInTheDocument();
  });

  test.each`
    placeholder
    ${PLACEHOLDERS.courses}
    ${PLACEHOLDERS.languages}
  `('should render field with $placeholder placeholder', async ({ placeholder }) => {
    renderCourseDetails();

    const fieldPlaceholder = await screen.findByText(placeholder);
    expect(fieldPlaceholder).toBeInTheDocument();
  });
});
