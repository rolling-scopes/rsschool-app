import { Button, Col, Row, Tag, theme } from 'antd';
import { FilterFilled } from '@ant-design/icons';

type FilteredTagsProps = {
  tagFilters: string[];
  onTagClose: (tag: string) => void;
  onClearAllButtonClick: () => void;
  filterName?: string;
  tagNameMap?: Record<string, string>;
};

export function FilteredTags({
  tagFilters,
  onTagClose,
  onClearAllButtonClick,
  filterName = '',
  tagNameMap,
}: FilteredTagsProps) {
  const { token } = theme.useToken();
  return (
    <>
      {tagFilters?.length > 0 ? (
        <Row style={{ padding: 12, background: token.colorBgContainer, marginBottom: 4, borderRadius: 4 }}>
          <Col flex="auto">
            <FilterFilled
              style={{
                color: token.colorTextLabel,
                marginRight: 8,
              }}
            />
            {tagFilters.map(tag => (
              <Tag key={tag} closable onClose={() => onTagClose(tag)}>
                {`${filterName}${tagNameMap?.[tag] || tag}`}
              </Tag>
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
}
