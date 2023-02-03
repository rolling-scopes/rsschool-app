import { Col, Row } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Location } from 'common/models';
import { PersonalInfo, ContactInfo, CourseDetails } from 'modules/Registry/components';
import { UserFull } from 'services/user';
import { CourseDto } from 'api';

type IdName = {
  id: number;
  name: string;
};

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
  student?: {
    profile: UserFull;
    registeredForCourses: IdName[];
    courses: CourseDto[];
  };
};

export function GeneralSection({ location, setLocation, student }: Props) {
  return (
    <Row justify="center" gutter={[0, 24]}>
      {student && (
        <Col span={24}>
          <CourseDetails student={student} />
        </Col>
      )}
      <Col span={24}>
        <PersonalInfo setLocation={setLocation} location={location} isStudentForm={!!student} />
      </Col>
      {!student && (
        <Col span={24}>
          <ContactInfo />
        </Col>
      )}
    </Row>
  );
}
