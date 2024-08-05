import { Typography, Space } from 'antd';
import { EmploymentRecordFormItem } from '../EmploymentCard';
import { Dayjs } from 'dayjs';

const workingPeriodFormat = 'MMM YYYY';
const { Title, Text } = Typography;

const getWorkingPeriod = (dateFrom: Dayjs, dateTo: Dayjs, toPresent: boolean): string => {
  const monthsDuration = Math.ceil(dateTo.diff(dateFrom, 'month', true));
  const monthsCount = monthsDuration % 12;
  const yearsCount = (monthsDuration - monthsCount) / 12;
  const months = monthsCount > 0 ? `${monthsCount} month${monthsCount > 1 ? 's' : ''}` : '';
  const years = yearsCount > 0 ? `${yearsCount} year${yearsCount > 1 ? 's' : ''}` : '';
  const duration = `${months} ${years}`.trim();

  return `${dateFrom.format(workingPeriodFormat)} - ${
    toPresent ? 'Present' : dateTo.format(workingPeriodFormat)
  } - ${duration}`;
};

const EmploymentHistoryDisplayItem = ({
  employmentRecord,
}: {
  employmentRecord: Omit<EmploymentRecordFormItem, 'location'>;
}) => {
  const { title, dateFrom, dateTo, toPresent, companyName } = employmentRecord;

  if (!title && !companyName) {
    return <Title level={5}>(Empty)</Title>;
  }

  return (
    <Space direction="vertical" size={0}>
      <Title level={5}>
        {title} at {companyName}
      </Title>
      {dateFrom && dateTo && <Text type="secondary">{getWorkingPeriod(dateFrom, dateTo, toPresent)}</Text>}
    </Space>
  );
};

export default EmploymentHistoryDisplayItem;
