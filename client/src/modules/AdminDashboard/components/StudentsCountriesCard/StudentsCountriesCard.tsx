import React from 'react';
import { Card } from 'antd';
import { StudentsCountriesStatsDto } from 'api';
import dynamic from 'next/dynamic';

type Props = {
  studentsCountriesStats: StudentsCountriesStatsDto;
};

const StudentsCountriesChart = dynamic(() => import('./StudentsCountriesChart'), { ssr: false });

export const StudentsCountriesCard = ({ studentsCountriesStats }: Props) => {
  const { countries, studentsActiveCount } = studentsCountriesStats;
  return (
    <Card title="Students Countries Stats">
      <StudentsCountriesChart data={countries} studentsActiveCount={studentsActiveCount} />
    </Card>
  );
};
