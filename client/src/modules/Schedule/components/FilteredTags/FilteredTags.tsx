import { Button, Col, Row, Tag } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';
import { CourseScheduleItemDto } from 'api';

type FilteredTagsProps = {
  tagFilters: string[];
  onTagClose: (tag: string) => void;
  onClearAllButtonClick: () => void;
  filterName?: string;
};

export const FilteredTags = ({ tagFilters, onTagClose, onClearAllButtonClick, filterName = '' }: FilteredTagsProps) =>
  tagFilters?.length > 0 ? (
    <Row style={{ padding: 12, background: '#fafafa' }}>
      <Col flex="auto">
        <FilterFilled style={{ color: 'rgba(0, 0, 0, 0.25)', marginRight: 8 }} />
        {tagFilters.map(tag => (
          <Tag key={tag} closable onClose={() => onTagClose(tag)}>{`${filterName}${TAG_NAME_MAP[tag as CourseScheduleItemDto['tag']] || tag
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
