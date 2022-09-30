/* eslint-disable import/prefer-default-export */
import type { MemoryLevel, SelectOptions } from './types';

// Services
export const CDN_STICKERS_URL = import.meta.env.VITE_CDN_STICKERS_URL;
export const CDN_CLEANED_URL = import.meta.env.VITE_CDN_CLEANED_URL;
export const STICKERS_JSON_URL = import.meta.env.VITE_STICKERS_JSON_URL;
export const CLEANED_JSON_URL = import.meta.env.VITE_CLEANED_JSON_URL;

// Sorting
export const SLOTH_SORTING: SelectOptions[] = [
  {
    value: 'name-asc',
    text: 'sorting.name+',
    type: 'name',
  },
  {
    value: 'name-desc',
    text: 'sorting.name-',
    type: 'name',
  },
];
export const GAME_RESULT_SORTING: SelectOptions[] = [
  {
    value: 'count-asc',
    text: 'btn.count+',
    type: 'count',
  },
  {
    value: 'count-desc',
    text: 'btn.count-',
    type: 'count',
  },
  {
    value: 'time-asc',
    text: 'btn.time+',
    type: 'time',
  },
  {
    value: 'time-desc',
    text: 'btn.time-',
    type: 'time',
  },
  {
    value: 'createdAt-asc',
    text: 'btn.createdAt+',
    type: 'createdAt',
  },
  {
    value: 'createdAt-desc',
    text: 'btn.createdAt-',
    type: 'createdAt',
  },
];

// Pagination
export const PAGINATION_OPTIONS: number[] = [10, 15, 20, 25, 50, 100];

// Memory Game
export const MEMORY_LEVELS: MemoryLevel[] = [
  {
    level: 'junior',
    n: 4,
  },
  {
    level: 'middle',
    n: 8,
  },
  {
    level: 'senior',
    n: 12,
  },
];
export const MEMORY_GAME_TIMEOUT = 1000;
export const MEMORY_GAME_COVER = './img/memory/card-cover.svg';
export const MEMORY_GAME_WINNER = './img/memory/winner1.svg';

// Guess Game
export const GUESS_GAME_WINNER = './img/guess/winner2.svg';

export const CATALOG_SLOTH_PREVIEW = './img/preview.svg';

export const GUESS_SLOTHS = [
  { caption: 'Error', img: './img/guess/painted/01.svg' },
  { caption: 'Activist', img: './img/guess/painted/02.svg' },
  { caption: 'Deadline', img: './img/guess/painted/03.svg' },
  { caption: 'Not a Bug', img: './img/guess/painted/04.svg' },
  { caption: 'Walk', img: './img/guess/painted/05.svg' },
  { caption: 'Google', img: './img/guess/painted/06.svg' },
  { caption: 'I Break', img: './img/guess/painted/07.svg' },
  { caption: 'How I See', img: './img/guess/painted/08.svg' },
  { caption: 'Lazy', img: './img/guess/painted/09.svg' },
  { caption: 'What Is It', img: './img/guess/painted/10.svg' },
  { caption: 'Works on My Machine', img: './img/guess/painted/11.svg' },
  { caption: 'This Is Love', img: './img/guess/painted/12.svg' },
  { caption: 'Codewars', img: './img/guess/painted/13.svg' },
  { caption: 'Finished Work', img: './img/guess/painted/14.svg' },
  { caption: 'Git Problem', img: './img/guess/painted/15.svg' },
  { caption: 'Github Friends', img: './img/guess/painted/16.svg' },
  { caption: 'Helper', img: './img/guess/painted/17.svg' },
  { caption: 'Hero', img: './img/guess/painted/18.svg' },
  { caption: 'One Hour Before Deadline', img: './img/guess/painted/19.svg' },
  { caption: 'Student 1', img: './img/guess/painted/20.svg' },
  { caption: 'Train', img: './img/guess/painted/21.svg' },
  { caption: 'Welcome', img: './img/guess/painted/22.svg' },
  { caption: 'It Is OK', img: './img/guess/painted/23.svg' },
  { caption: 'Interview with Mentor', img: './img/guess/painted/24.svg' },
  { caption: 'Lecture with Mentor', img: './img/guess/painted/25.svg' },
  { caption: 'Mentor', img: './img/guess/painted/26.svg' },
  { caption: 'Mentor with His Students', img: './img/guess/painted/27.svg' },
  { caption: 'Time to Pay', img: './img/guess/painted/28.svg' },
  { caption: 'Wanted Mentors', img: './img/guess/painted/29.svg' },
  { caption: 'WTF', img: './img/guess/painted/30.svg' },
  { caption: 'Expert', img: './img/guess/painted/31.svg' },
  { caption: 'Shocked', img: './img/guess/painted/32.svg' },
  { caption: 'Congratulation', img: './img/guess/painted/33.svg' },
  { caption: 'Read the Chat', img: './img/guess/painted/34.svg' },
  { caption: 'So Little Work I Done', img: './img/guess/painted/35.svg' },
  { caption: 'Student without Mentor', img: './img/guess/painted/36.svg' },
  { caption: 'Thank you', img: './img/guess/painted/37.svg' },
  { caption: "it's a Good Job", img: './img/guess/painted/38.svg' },
  { caption: 'Congrats', img: './img/guess/painted/39.svg' },
  { caption: 'No Mentor', img: './img/guess/painted/40.svg' },
];
