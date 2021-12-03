import { GetServerSideProps } from 'next';
import { parse } from 'cookie';
import { StudentsService } from 'services/students';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const studentId = ctx.params?.studentId;
    if (!studentId) {
      throw new Error();
    }
    const cookies = parse(ctx.req?.headers.cookie || '');
    const student = await new StudentsService(cookies['auth-token']).getStudent(Number(studentId));
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
