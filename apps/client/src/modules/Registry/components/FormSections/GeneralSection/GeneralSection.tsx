import { Col, Row } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Location } from 'common/models';
import { PersonalInfo, ContactInfo, CourseDetails } from 'modules/Registry/components';
import { CourseDto } from 'api';

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
  courses?: CourseDto[];
};

export function GeneralSection({ location, setLocation, courses }: Props) {
  const isStudentForm = !!courses;
  const isMentorForm = !isStudentForm;

  return (
    <Row justify="center" gutter={[0, 24]}>
      {isStudentForm && (
        <Col span={24}>
          <CourseDetails courses={courses} />
        </Col>
      )}
      <Col span={24}>
        <PersonalInfo setLocation={setLocation} location={location} isStudentForm={isStudentForm} />
      </Col>
      {isMentorForm && (
        <Col span={24}>
          <ContactInfo />
        </Col>
      )}
    </Row>
  );
}
