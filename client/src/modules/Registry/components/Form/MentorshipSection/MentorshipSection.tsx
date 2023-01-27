import { DisciplineDto } from 'api';
import { Course } from 'services/models';
import css from 'styled-jsx/css';
import { Preferences, Disciplines, AdditionalInfo } from 'modules/Registry/components';

type Props = {
  checkedList: number[];
  courses: Course[];
  disciplines: DisciplineDto[];
  onPrevious: () => void;
};

const styles = css`
  @media (min-width: 800px) {
    :global(.ant-form-item) {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    :global(.ant-row .ant-form-item-row) {
      position: relative;
      max-width: 360px;
      width: 100%;
    }

    :global(.ant-form-item-label) {
      position: absolute;
      width: 205px;
      left: -205px;
    }

    :global(.buttons .ant-form-item-control-input-content) {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

export function MentorshipSection({ courses, checkedList, disciplines, onPrevious }: Props) {
  return (
    <>
      <Disciplines disciplines={disciplines} />
      <Preferences />
      <AdditionalInfo courses={courses} checkedList={checkedList} onPrevious={onPrevious} />
      <style jsx>{styles}</style>
    </>
  );
}
