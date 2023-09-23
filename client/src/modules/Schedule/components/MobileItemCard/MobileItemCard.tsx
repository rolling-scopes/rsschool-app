import { CourseScheduleItemDto } from 'api';
import { Row, Col, Typography } from 'antd';
import { SwapRightOutlined } from '@ant-design/icons';
import { coloredDateRenderer } from 'components/Table';
import { renderTagWithStyle, statusRenderer } from '../TableView/renderers';
import Link from 'next/link';

const { Title } = Typography;

export const MobileItemCard = ({ item }: { item: CourseScheduleItemDto }) => {
  return (
    <div style={{ padding: '12px 0px', backgroundColor: 'white', borderBottom: '1px groove' }}>
      <Row gutter={12} wrap={false}>
        <Col flex="1">
          <Link href={item.descriptionUrl ? item.descriptionUrl : ''} target="_blank">
            <Title level={5}>{item.name}</Title>
          </Link>
        </Col>
        <Col flex="0 0 auto">{renderTagWithStyle(item.tag)}</Col>
      </Row>
      <Row gutter={12} wrap={false}>
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
