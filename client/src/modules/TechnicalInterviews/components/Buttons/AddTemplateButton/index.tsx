import { Button } from 'antd';
import Link from 'next/link';

export function AddTemplateButton() {
  return (
    <Link href="/admin/interview-template/new">
      <Button type="primary">Add Templates</Button>
    </Link>
  );
}
