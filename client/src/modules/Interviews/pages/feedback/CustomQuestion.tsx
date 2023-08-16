import { useRef } from 'react';
import { Button, Card, Col, Input, InputRef, Row, Space } from 'antd';

type Props = {
  cancel: () => void;
  save(question: string): void;
};

export function CustomQuestion({ cancel, save }: Props) {
  const addRef = useRef<InputRef>(null);

  function saveQuestion() {
    if (!addRef.current?.input?.value.trim()) {
      return;
    }

    save(addRef.current.input.value);
  }

  return (
    <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
      <Input
        placeholder="Enter your question"
        ref={addRef}
        autoFocus
        onPressEnter={e => {
          // prevent form submit
          e.preventDefault();
          saveQuestion();
        }}
      />
      <Row style={{ marginTop: 15 }}>
        <Col flex={1} />
        <Space>
          <Button onClick={cancel}>Cancel</Button>
          <Button type="primary" onClick={saveQuestion}>
            Save
          </Button>
        </Space>
      </Row>
    </Card>
  );
}
