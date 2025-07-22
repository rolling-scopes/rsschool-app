import { Button, Col, Row, Tag, theme } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';
import { CourseScheduleItemDto } from 'api';

type FilteredTagsProps = {
  tagFilters: string[];
  onTagClose: (tag: string) => void;
  onClearAllButtonClick: () => void;
  filterName?: string;
};

export const FilteredTags = ({ tagFilters, onTagClose, onClearAllButtonClick, filterName = '' }: FilteredTagsProps) => {
  const { token } = theme.useToken();
  return (
    <>
      {tagFilters?.length > 0 ? (
        <Row style={{ padding: 12, background: token.colorBgContainer }}>
          <Col flex="auto">
            <FilterFilled
              style={{
                color: token.colorTextLabel,
                marginRight: 8,
              }}
            />
            {tagFilters.map(tag => (
              <Tag key={tag} closable onClose={() => onTagClose(tag)}>{`${filterName}${
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
      ) : null}
    </>
  );
};
