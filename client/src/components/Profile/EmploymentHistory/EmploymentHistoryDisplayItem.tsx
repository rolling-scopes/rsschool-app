import { Typography, Space } from 'antd';
import { EmploymentRecordFormItem } from '../EmploymentCard';
import { Dayjs } from 'dayjs';

const workingPeriodFormat = 'MMM YYYY';
const { Title, Text } = Typography;

const EmploymentHistoryDisplayItem = ({
  employmentRecord,
}: {
  employmentRecord: Omit<EmploymentRecordFormItem, 'officeLocation'>;
}) => {
  const { title, dateFrom, dateTo, toPresent, companyName } = employmentRecord;

  if (!title && !companyName) {
    return <Title level={5}>(Empty)</Title>;
  }

  const getWorkingPeriod = (dateFrom: Dayjs, dateTo: Dayjs): string => {
    const monthsDuration = dateTo.diff(dateFrom, 'month');
    const monthsCount = monthsDuration % 12;
    const yearsCount = (monthsDuration - monthsCount) / 12;
    const months = monthsCount > 0 ? `${monthsCount} month${monthsCount > 1 ? 's' : ''}` : '';
    const years = yearsCount > 0 ? `${yearsCount} year${yearsCount > 1 ? 's' : ''}` : '';
    const duration = `${months} ${years}`.trim();

    return `${dateFrom.format(workingPeriodFormat)} - ${
      toPresent ? 'Present' : dateTo.format(workingPeriodFormat)
    } - ${duration}`;
  };

  return (
    <Space direction="vertical" size={0}>
      <Title level={5}>
        {title} at {companyName}
      </Title>
      {dateFrom && dateTo && <Text type="secondary">{getWorkingPeriod(dateFrom, dateTo)}</Text>}
    </Space>
  );
};

export default EmploymentHistoryDisplayItem;
