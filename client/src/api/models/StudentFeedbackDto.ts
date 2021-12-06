/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PersonDto } from './PersonDto';
import type { StudentFeedbackContentDto } from './StudentFeedbackContentDto';

export type StudentFeedbackDto = {
    id: number;
    createdDate: string;
    updatedDate: string;
    content: StudentFeedbackContentDto;
    recommendation: string;
    author: PersonDto;
    mentor: PersonDto;
    englishLevel: string;
}
