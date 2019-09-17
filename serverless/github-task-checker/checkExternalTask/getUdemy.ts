import axios, { AxiosResponse } from 'axios';

const COURSES_URLS = [
  '/course/foundations-of-front-end-development/',
  '/course/web-development-learn-by-doing-html5-css3-from-scratch-introductory/',
  '/course/master-the-basics-of-html5-css3-beginner-web-development/',
]

const REQUIRED_COURSES_COUNT = 2;

export default async (certificates) => {
  try {
    const [certId1, certId2] = certificates;
    const isNotEmpty = Boolean(certId1 && certId2);
    const isNotEqual = certId1 !== certId2;

    const urls = certificates
      .map(certId => `https://www.udemy.com/api-2.0/certificates/${certId}?fields[certificate]=code,completion_date,user,course&fields[user]=title&fields[course]=id,title,url`);

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

    const isTheSameUser = courses.slice(1)
      .filter(({ username }) => courses[0].username === username)
      .length > 0;

    console.log('Udemy courses =>', JSON.stringify(courses));

    return isNotEmpty&& isNotEqual && isTheSameUser && courses.length === REQUIRED_COURSES_COUNT;
  } catch (error) {
    console.log(`Error fetching ${certificates} certificates!\n${error.message}`);
    return false;
  }
};
