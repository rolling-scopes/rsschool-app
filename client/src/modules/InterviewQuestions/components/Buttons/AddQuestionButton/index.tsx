import { Button } from 'antd';

type Props = {
  onClick: () => void;
};

export function AddQuestionButton(props: Props) {
  return (
    <Button type="primary" onClick={props.onClick}>
      Add Question
    </Button>
  );
}
