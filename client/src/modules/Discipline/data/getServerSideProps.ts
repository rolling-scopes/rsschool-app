import { GetServerSideProps } from 'next';
import { DisciplineService } from '../../../services/discipline';
import { getTokenFromContext } from '../../../utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    const disciplines = await new DisciplineService(token).getAllDisciplines();
    return {
      props: { disciplines },
    };
  } catch (e) {
    return {
      props: { disciplines: [] },
    };
  }
};
