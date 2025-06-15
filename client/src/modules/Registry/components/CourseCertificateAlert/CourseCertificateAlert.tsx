import { Button, Result } from 'antd';

type CourseCertificateAlertProps = {
  certificateDiscipline?: string;
};

export function CourseCertificateAlert({ certificateDiscipline = 'any' }: CourseCertificateAlertProps) {
  return (
    <Result
      status="info"
      icon={
        <img
          src="https://cdn.rs.school/sloths/cleaned/train.svg"
          alt="train icon"
          style={{ width: 100, height: 100 }}
        />
      }
      title={`To register for this course, you need to already have ${certificateDiscipline} RS School certificate.`}
      subTitle={`Complete ${certificateDiscipline} course to unlock access.`}
      extra={
        <Button type="primary" href="/">
          Back to Home
        </Button>
      }
    />
  );
}
