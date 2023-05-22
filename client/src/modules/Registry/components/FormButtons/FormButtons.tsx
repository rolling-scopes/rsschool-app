import { Row, Col, Button } from 'antd';

type Props = {
  onPrevious?: () => void;
  submitTitle?: string;
};

export function FormButtons({ onPrevious, submitTitle = 'Submit' }: Props) {
  return (
    <Row justify="center" className="buttons" gutter={24}>
      {onPrevious ? (
        <Col>
          <Button size="large" type="default" onClick={onPrevious}>
            Previous
          </Button>
        </Col>
      ) : null}
      <Col>
        <Button size="large" type="primary" htmlType="submit">
          {submitTitle}
        </Button>
      </Col>
    </Row>
  );
}
