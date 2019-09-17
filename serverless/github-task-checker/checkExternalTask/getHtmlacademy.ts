import axios, { AxiosResponse } from 'axios';

const URL = 'https://htmlacademy.ru/profile/';
const TASKS = [
  'Знакомство с HTML и CSS',
  'Структура HTML-документа',
  'Разметка текста',
  'Ссылки и изображения',
  'Основы СSS',
  'Оформление текста',
  'Знакомство с таблицами',
  'Знакомство с формами',
  'Селекторы, часть 1',
  'Наследование и каскадирование',
];

export default async (username) => {
  try {
    const urls = [
      `${URL}${username}/category?name=basic-html&t=1551516408650`,
      `${URL}${username}/category?name=basic-css&t=1551611672125`,
      `${URL}${username}/category?name=basic-html-css&t=1568144853778`,
    ];

    const pages = (await Promise.all(urls.map(url => axios.get(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }))))
      .map((res: AxiosResponse) => res.data);

    const [theme1, theme2, theme3] = pages
      .map(course => course.content
        .replace('</span></span></li>', '')
        .split('<li class="course-stats__course"><p class="course-stats__course-name">')
        .splice(1)
        .map(topic => topic.replace(/<[^>]+>|Прогресс:|\%.*/g, '').trim())
        .filter(topic => Number(topic.slice(topic.lastIndexOf(' '))) > 74)
        .map(topic => topic
          .slice(0, topic.lastIndexOf(' '))
          .replace('[Архив] ', '')
          .replace(/[xA0]/g, ' '),
      )
      .map((achievement) => (
        achievement === 'Знакомство'
          ? 'Знакомство с HTML и CSS'
          : achievement === 'Знакомство с CSS'
            ? 'Основы СSS'
            : achievement
      )));

    const skills = [... new Set([...theme1, ...theme2, ...theme3])]
        .filter(skill => TASKS.includes(skill));

    console.log('Htmlacademy skills =>', JSON.stringify(skills));

    return skills.length === TASKS.length;
  } catch (error) {
    console.log(`Error fetching ${username} pages!\n${error.message}`);
    return false;
  }
};
