import { CourseScheduleItemDto } from 'api';
import { Row, Col, Typography } from 'antd';
import { SwapRightOutlined } from '@ant-design/icons';
import { coloredDateRenderer } from 'components/Table';
import { renderTagWithStyle, statusRenderer } from '../TableView/renderers';

const { Title } = Typography;

export const MobileItemCard = ({ item }: { item: CourseScheduleItemDto }) => {
  return (
    <div style={{ padding: '12px', backgroundColor: 'white', borderBottom: '1px groove' }}>
      <Row gutter={8} wrap={false}>
        <Col flex="1">
          <Title level={5} ellipsis={{ expandable: true, rows: 1 }}>
            {item.name}
          </Title>
        </Col>
        <Col flex="0 0 auto">{renderTagWithStyle(item.tag)}</Col>
      </Row>
      <Row gutter={8} wrap={false}>
        <Col flex="1">{statusRenderer(item.status)}</Col>
        <Col flex="0 0 auto">
          {coloredDateRenderer('UTC', 'MMM D HH:mm', 'start', 'Recommended date for studying')(item.startDate, item)}
          {item.endDate && (
            <>
              {' '}
              <SwapRightOutlined />{' '}
            </>
          )}
          {item.endDate &&
            coloredDateRenderer('UTC', 'MMM D HH:mm', 'end', 'Recommended date for studying')(item.endDate, item)}
        </Col>
      </Row>
    </div>
  );
};
