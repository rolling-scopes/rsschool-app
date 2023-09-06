import { Button, Col, Row, Tag } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { ColumnName, TAG_NAME_MAP } from 'modules/Schedule/constants';
import { CourseScheduleItemDto } from 'api';
import { capitalize } from 'lodash';

type FilteredTagsProps = {
  filters: { column?: ColumnName; tags: string[]; onClose: (tag: string) => void }[];
  onClearAllButtonClick: () => void;
};

const getTagText = (tag: string, column?: ColumnName) => {
  switch (column) {
    case ColumnName.Type:
      return TAG_NAME_MAP[tag as CourseScheduleItemDto['tag']];
    case ColumnName.Status:
      return capitalize(tag);
    default:
      return tag;
  }
};

export const FilteredTags = ({ filters, onClearAllButtonClick }: FilteredTagsProps) =>
  filters.some(({ tags }) => tags?.length) ? (
    <Row style={{ padding: 12, background: '#fafafa' }}>
      <Col flex="auto">
        <FilterFilled style={{ color: 'rgba(0, 0, 0, 0.25)', marginRight: 8 }} />
        {filters.map(({ column, tags, onClose }) => {
          if (!tags?.length) {
            return;
          }
          const prefix = column ? `${column}: ` : '';
          return tags.map(tag => {
            return <Tag key={tag} closable onClose={() => onClose(tag)}>{`${prefix}${getTagText(tag, column)}`}</Tag>;
          });
        })}
      </Col>
      <Col flex="none">
        <Button size="small" onClick={onClearAllButtonClick}>
          Clear all
        </Button>
      </Col>
    </Row>
  ) : null;
