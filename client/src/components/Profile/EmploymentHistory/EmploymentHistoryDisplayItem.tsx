import { Typography, Space } from 'antd';
import { EmploymentRecordDto } from 'api';
import dayjs from 'dayjs';

const workingPeriodFormat = 'MMM YYYY';
const { Title, Text } = Typography;

const EmploymentHistoryDisplayItem = ({
  employmentRecord,
}: {
  employmentRecord?: Omit<EmploymentRecordDto, 'officeLocation'>;
}) => {
  const { title, toPresent, companyName } = employmentRecord ?? {};
  const dateFrom = employmentRecord?.dateFrom ? dayjs(Number(employmentRecord?.dateFrom)) : dayjs();
  const dateTo = employmentRecord?.dateTo ? dayjs(Number(employmentRecord?.dateTo)) : dayjs();

  if (!title && !companyName) {
    return <Title level={5}>(Empty)</Title>;
  }

  const monthsDuration = dateTo.diff(dateFrom, 'month');
  const monthsCount = monthsDuration % 12;
  const yearsCount = (monthsDuration - monthsCount) / 12;
  const months = monthsCount > 0 ? `${monthsCount} month${monthsCount > 1 ? 's' : ''}` : '';
  const years = yearsCount > 0 ? `${yearsCount} year${yearsCount > 1 ? 's' : ''}` : '';
  const duration = `${months} ${years}`.trim();

  const workingPeriod = `${dateFrom.format(workingPeriodFormat)} - ${
    toPresent ? 'Present' : dateTo.format(workingPeriodFormat)
  } - ${duration}`;

  return (
    <Space direction="vertical" size={0}>
      <Title level={5}>
        {title} at {companyName}
      </Title>
      <Text type="secondary">{workingPeriod}</Text>
    </Space>
  );
};

export default EmploymentHistoryDisplayItem;
