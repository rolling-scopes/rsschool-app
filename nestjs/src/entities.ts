import { CourseLeaveSurveyResponse } from './expelled-stats/entities/course-leave-survey-response.entity';
import { Student } from '../../server/src/models/student';
import { User } from '../../server/src/models/user';
import { Course } from '../../server/src/models/course';

export const models = [CourseLeaveSurveyResponse, Student, User, Course];
