import { GetServerSideProps } from 'next';
import { StudentsService } from 'services/students';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const studentId = ctx.params?.studentId;
    if (!studentId) {
      throw new Error();
    }
    const token = getTokenFromContext(ctx);
    const student = await new StudentsService(token).getStudent(Number(studentId));
    return {
      props: {
        params: ctx?.params ?? {},
        student,
      },
    };
  } catch (e) {
    return {
      props: {
        params: {},
        student: null,
      },
    };
  }
};
