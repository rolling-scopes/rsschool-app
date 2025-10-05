import { useCallback, useState } from 'react';
import { Badge, Button, Space, Tabs, TabsProps, Tooltip, Typography } from 'antd';
import { ScoreTable } from '@client/modules/Score/components/ScoreTable/index';
import { CoursePageProps } from '@client/services/models';
import { useRouter } from 'next/router';
import { getExportCsvUrl } from '@client/modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from '@client/modules/Score/data/isExportEnabled';
import { UpdateAlert } from '@client/modules/Score/pages/ScorePage/UpdateAlert';
import { ExportCsvButton } from '@client/modules/Score/components/ExportCsvButton';
import { SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;

type Props = {
  tabProps: CoursePageProps & {
    onLoading: (value: boolean) => void;
  };
};

const TabLabel = ({ title, counter }: { title: string; counter: number }) => (
  <Space>
    <Text>{title}</Text>
    <Badge count={counter} style={{ backgroundColor: '#e6f7ff', color: '#1677ff' }} />
  </Space>
);

export const ScoreTableTabs = ({ tabProps }: Props) => {
  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;
  const [statData, setStatData] = useState<[number, number]>([0, 0]);
  const [isVisibleSetting, setIsVisibleSettings] = useState(false);

  const { course, session } = tabProps;

  const tabs: TabsProps['items'] = [
    {
      key: 'all',
      label: <TabLabel title="All students" counter={statData[0]} />,
      children: (
        <ScoreTable
          {...tabProps}
          activeOnly={false}
          setStatData={setStatData}
          isVisibleSetting={isVisibleSetting}
          setIsVisibleSettings={setIsVisibleSettings}
        />
      ),
    },
    {
      key: 'active',
      label: <TabLabel title="Active students" counter={statData[1]} />,
      children: (
        <ScoreTable
          {...tabProps}
          activeOnly={true}
          setStatData={setStatData}
          isVisibleSetting={isVisibleSetting}
          setIsVisibleSettings={setIsVisibleSettings}
        />
      ),
    },
  ];

  const handleExportCsv = useCallback(
    () => (window.location.href = getExportCsvUrl(course?.id, cityName, mentor)),
    [cityName, mentor, course?.id],
  );

  const csvEnabled = isExportEnabled({ course, session });

  return (
    <Tabs
      tabBarStyle={{ marginBottom: 0 }}
      items={tabs}
      defaultActiveKey="active"
      tabBarExtraContent={
        <Space style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UpdateAlert />
          <ExportCsvButton enabled={csvEnabled} onClick={handleExportCsv} />
          <Tooltip title="Table settings" placement="left">
            <Button shape="circle" type="text" title="Settings" onClick={() => setIsVisibleSettings(true)}>
              <SettingOutlined style={{ fontSize: '2.5ch', display: 'block' }} />
            </Button>
          </Tooltip>
        </Space>
      }
    />
  );
};
