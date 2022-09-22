import { Tag } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { TAG_NAME_MAP } from 'modules/Schedule/constants';
import { CourseScheduleItemDto } from 'api';

type FilteredTagsProps = {
  tagFilter: string[];
  onTagClose: (tag: string) => void;
};

export const FilteredTags = ({ tagFilter, onTagClose }: FilteredTagsProps) =>
  tagFilter?.length > 0 ? (
    <div style={{ marginBottom: 14 }}>
      <FilterFilled style={{ color: 'rgba(0, 0, 0, 0.25)', marginRight: 10 }} />
      {tagFilter.map(tag => (
        <Tag key={tag} closable onClose={() => onTagClose(tag)}>{`Tag: ${
          TAG_NAME_MAP[tag as CourseScheduleItemDto['tag']] || tag
        }`}</Tag>
      ))}
    </div>
  ) : null;
