import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser';
import { Result } from './types';

const URL = 'https://www.codecademy.com/';
const TASKS = ['Introduction to HTML', 'Learn CSS'];

export default async (username: string): Promise<Result> => {
  if (!username) {
    return {
      result: false,
      details: 'No Codecademy account provided',
    };
  }

  const url = `${URL}${username}`;

  try {
    const page = (await axios.get(url)).data;
    const dom = parse(page) as HTMLElement;

    const skills = dom
      .querySelectorAll('.contentContainer__3yhRX203mZ5d3LM9QdQ1lj')
      .map(skill => {
        const name = skill.querySelector('.title__3niw5hwoyf-vt1SazvY5Gd').childNodes[0].rawText;
        const isPassed =
          skill.querySelector('.description__5pwX6COkDGktqHdkXYDuu').childNodes[0].rawText === 'Completed';

        return { name, isPassed };
      })
      .filter(skill => TASKS.includes(skill.name) && skill.isPassed);

    console.log('Codecademy skills =>', JSON.stringify(skills));

    return {
      result: skills.length === TASKS.length,
      details: [
        `Codecademy. Required courses: ${JSON.stringify(TASKS)}`,
        `Passed courses: ${JSON.stringify(skills)}`,
      ].join(' / '),
    };
  } catch (error) {
    console.log(`Error fetching ${url} page!\n${error.message}`);
    return { result: false, details: error.message };
  }
};
