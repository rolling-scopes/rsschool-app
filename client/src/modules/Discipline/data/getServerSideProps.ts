import { GetServerSideProps } from 'next';
import { DisciplineService } from '../../../services/discipline';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const disciplines = await new DisciplineService(ctx).getAllDisciplines();
    return {
      props: { disciplines },
    };
  } catch (e) {
    return {
      props: { disciplines: [] },
    };
  }
};
