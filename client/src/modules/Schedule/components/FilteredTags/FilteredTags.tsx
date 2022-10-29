import { Button, Col, Row, Tag } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { ColumnName, TAG_NAME_MAP } from 'modules/Schedule/constants';
import { CourseScheduleItemDto } from 'api';

type FilteredTagsProps = {
  tagFilter: string[];
  onTagClose: (tag: string) => void;
  onClearAllButtonClick: () => void;
};

export const FilteredTags = ({ tagFilter, onTagClose, onClearAllButtonClick }: FilteredTagsProps) =>
  tagFilter?.length > 0 ? (
    <Row style={{ padding: 12, background: 'white' }}>
      <Col flex="auto">
        <FilterFilled style={{ color: 'rgba(0, 0, 0, 0.25)', marginRight: 8 }} />
        {tagFilter.map(tag => (
          <Tag key={tag} closable onClose={() => onTagClose(tag)}>{`${ColumnName.Type}: ${
            TAG_NAME_MAP[tag as CourseScheduleItemDto['tag']] || tag
          }`}</Tag>
        ))}
      </Col>
      <Col flex="none">
        <Button size="small" onClick={onClearAllButtonClick}>
          Clear all
        </Button>
      </Col>
    </Row>
  ) : null;
