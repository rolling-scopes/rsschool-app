import { CourseScheduleItemDto } from 'api';
import { Row, Col, Typography } from 'antd';
import { coloredDateRenderer } from 'components/Table';
import { renderTagWithStyle, statusRenderer } from '../TableView/renderers';

const { Title } = Typography;

export const MobileItemCard = ({ item }: { item: CourseScheduleItemDto }) => {
  return (
    <div style={{ padding: '12px', backgroundColor: 'white', borderBottom: '1px groove' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Title level={5}>{item.name}</Title>
        </Col>
        <Col span={12}>{renderTagWithStyle(item.tag)}</Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>{statusRenderer(item.status)}</Col>
        <Col span={12}>
          {coloredDateRenderer('UTC', 'MMM D HH:mm', 'start', 'Recommended date for studying')(item.startDate, item)} -{' '}
          {coloredDateRenderer('UTC', 'MMM D HH:mm', 'end', 'Recommended date for studying')(item.endDate, item)}
        </Col>
      </Row>
    </div>
  );
};
