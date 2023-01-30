import { DisciplineDto } from 'api';
import { Course } from 'services/models';
import { Preferences, Disciplines, AdditionalInfo } from 'modules/Registry/components';
import { Col, Row } from 'antd';

type Props = {
  checkedList: number[];
  courses: Course[];
  disciplines: DisciplineDto[];
  onPrevious: () => void;
};

export function MentorshipSection({ courses, checkedList, disciplines, onPrevious }: Props) {
  return (
    <Row justify="center" gutter={[0, 24]}>
      <Col span={24}>
        <Disciplines disciplines={disciplines} />
      </Col>
      <Col span={24}>
        <Preferences />
      </Col>
      <Col span={24}>
        <AdditionalInfo courses={courses} checkedList={checkedList} onPrevious={onPrevious} />
      </Col>
    </Row>
  );
}
