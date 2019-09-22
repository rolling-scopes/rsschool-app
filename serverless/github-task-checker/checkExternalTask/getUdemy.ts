import axios, { AxiosResponse } from 'axios';
import { Result } from './types';
const COURSES_URLS = [
  '/course/foundations-of-front-end-development/',
  '/course/web-development-learn-by-doing-html5-css3-from-scratch-introductory/',
  '/course/master-the-basics-of-html5-css3-beginner-web-development/',
];

const REQUIRED_COURSES_COUNT = 1;

export default async (certificates): Promise<Result> => {
  try {
    const urls = certificates
      .filter(Boolean)
      .map(
        certId =>
          `https://www.udemy.com/api-2.0/certificates/${certId}?fields[certificate]=code,completion_date,user,course&fields[user]=title&fields[course]=id,title,url`,
      );

    const courses = (await Promise.all(urls.map(url => axios.get(url))))
      .map((res: AxiosResponse) => res.data)
      .map(({ user, course }) => {
        const username = user.title;
        const url = course.url;

        return {
          username,
          url,
        };
      })
      .filter(({ url }) => COURSES_URLS.includes(url));

    console.log('Udemy courses =>', JSON.stringify(courses));

    return {
      result: courses.length >= REQUIRED_COURSES_COUNT,
      details: [
        `Udemy. Required courses count: ${REQUIRED_COURSES_COUNT}`,
        `Passed course count: ${courses.length}`,
      ].join(' / '),
    };
  } catch (error) {
    console.log(`Error fetching ${certificates} certificates!\n${error.message}`);
    return { result: false, details: error.message };
  }
};
