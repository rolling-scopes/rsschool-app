import { List } from 'antd';
import Link from 'next/link';
import { LinkRenderData } from '@client/modules/Home/data/links';

type CourseLinksProps = {
  courseLinks: LinkRenderData[];
};

export default function CourseLinks({ courseLinks }: CourseLinksProps) {
  if (!courseLinks.length) {
    return null;
  }

  return (
    <List
      size="small"
      bordered
      dataSource={courseLinks}
      renderItem={linkInfo => (
        <List.Item key={linkInfo.url}>
          <Link prefetch={false} href={linkInfo.url}>
            {linkInfo.icon} {linkInfo.name}
          </Link>
        </List.Item>
      )}
    />
  );
}
