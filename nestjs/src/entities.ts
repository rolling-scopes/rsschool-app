import { CourseLeaveSurveyResponse } from '../../common/models/course-leave-survey-response';
import { Student } from '../../server/src/models/student';
import { User } from '../../server/src/models/user';
import { Course } from '../../server/src/models/course';

export const models = [CourseLeaveSurveyResponse, Student, User, Course];
