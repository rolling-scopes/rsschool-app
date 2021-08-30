import { Button } from 'antd';

type Props = {
  onClick: () => void;
};

export function AddCategoryButton(props: Props) {
  return (
    <Button type="primary" onClick={props.onClick}>
      Add Category
    </Button>
  );
}
