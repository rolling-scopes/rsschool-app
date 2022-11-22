import { AxiosError } from 'axios';
import { useReducer } from 'react';
import {
  CourseTaskDto,
  CoursesTasksApi,
  CreateCourseTaskDtoCheckerEnum,
  CoursesTaskSolutionsApi,
  CourseTaskDtoTypeEnum,
} from 'api';

type Action = {
  type: 'loading' | 'open' | 'close' | 'error' | 'submit';
  state?: State;
};

export type State = {
  errorText?: string;
  submitted?: boolean;
  data?: { courseTasks: CourseTaskDto[] };
  loading?: boolean;
} | null;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { loading: true };
    case 'open':
      return { loading: false, data: action.state?.data };
    case 'submit':
      return { submitted: true, data: state?.data };
    case 'close':
      return null;
    case 'error':
      return { errorText: action.state?.errorText, data: state?.data };
    default:
      return state;
  }
}

export function useSubmitTaskSolution(courseId: number) {
  const [state, dispatch] = useReducer(reducer, null);

  const showModal = async () => {
    dispatch({ type: 'loading' });
    const coursesTasksApi = new CoursesTasksApi();
    const { data } = await coursesTasksApi.getCourseTasks(courseId);
    const courseTasks = data.filter(
      item =>
        item.checker === CreateCourseTaskDtoCheckerEnum.Mentor &&
        item.type != CourseTaskDtoTypeEnum.Selfeducation &&
        item.type != CourseTaskDtoTypeEnum.StageInterview &&
        item.type != CourseTaskDtoTypeEnum.Interview,
    );
    dispatch({ type: 'open', state: { data: { courseTasks } } });
  };

  const saveSolution = async (values: { courseTaskId: number; url: string }) => {
    try {
      const api = new CoursesTaskSolutionsApi();
      await api.createTaskSolution(courseId, values.courseTaskId, { url: values.url });
      dispatch({ type: 'submit' });
    } catch (err) {
      const error = err as AxiosError;
      dispatch({ type: 'error', state: { errorText: (error.response?.data as Error).message ?? error.message } });
    }
  };

  const closeModal = () => dispatch({ type: 'close' });

  return {
    state,
    saveSolution,
    showModal,
    closeModal,
  };
}
