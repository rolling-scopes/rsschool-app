/* eslint-disable import/prefer-default-export */

import type { ErrorDescription, MemoryLevel, SelectOptions } from './types';

// Services
export const BASE = import.meta.env.VITE_BFF_URL;
export const CDN_URL = import.meta.env.VITE_CDN_URL;
export const STICKERS_JSON_URL = import.meta.env.VITE_STICKERS_JSON_URL;
export const CLEANED_JSON_URL = import.meta.env.VITE_CLEANED_JSON_URL;

// custom Errors
export const JSON_ERROR: ErrorDescription = { code: 'NOT_JSON', message: 'Response is not a JSON!' };

// Sorting
export const SLOTH_SORTING: SelectOptions[] = [
  {
    value: 'name-desc',
    text: 'sorting.name-',
  },
  {
    value: 'name-asc',
    text: 'sorting.name+',
  },
];
export const GAME_RESULT_SORTING: SelectOptions[] = [
  {
    value: 'count-asc',
    text: 'btn.count+',
  },
  {
    value: 'count-desc',
    text: 'btn.count-',
  },
  {
    value: 'time-asc',
    text: 'btn.time+',
  },
  {
    value: 'time-desc',
    text: 'btn.time-',
  },
  {
    value: 'createdAt-asc',
    text: 'btn.createdAt+',
  },
  {
    value: 'createdAt-desc',
    text: 'btn.createdAt-',
  },
];

// Pagination
export const PAGINATION_OPTIONS: number[] = [10, 15, 20, 25, 50, 100];

// Users
export const DEFAULT_USER_AVATAR = './img/profile/default.svg';
export const AUTHORIZATION_IMG = './img/github.svg';
export const AUTHORIZATION_URL = `${BASE}/auth/github`;

// Memory Game
export const MEMORY_LEVELS: MemoryLevel[] = [
  {
    level: 'junior',
    n: 4,
    gameId: '36fdb508-80e4-4e0d-a6b8-78fe7e66a5d5',
  },
  {
    level: 'middle',
    n: 8,
    gameId: 'ca0305dc-9dab-4f36-84f1-45f8223818e0',
  },
  {
    level: 'senior',
    n: 12,
    gameId: '42df7648-5c56-4a66-a288-ec6acf8b18b0',
  },
];
export const MEMORY_GAME_TIMEOUT = 1000;
export const MEMORY_GAME_COVER = './img/memory/card-cover.svg';
export const MEMORY_GAME_WINNER = './img/memory/winner1.svg';

// Guess Game
export const GUESS_GAME_ID = '431b4880-0ac6-4082-ae9f-b34f5f9a84a6';
export const GUESS_GAME_WINNER = './img/guess/winner3.svg';
export const GUESS_GAME_WINNER_ALL = './img/guess/winner2.svg';

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

export const MEMES_SLOTHS = [
  './img/memes/slothorian.png',
  './img/memes/deadline.png',
  './img/memes/expert.png',
  './img/memes/git.png',
  './img/memes/its_ok.png',
  './img/memes/love.png',
  './img/memes/mentor.png',
  './img/memes/read_chat.png',
  './img/memes/shocked.png',
  './img/memes/so_close.png',
  './img/memes/student_1.png',
  './img/memes/without_mentor.png',
  './img/memes/work_done.png',
  './img/memes/wtf.png',
  './img/memes/bug.png',
  './img/memes/codewars.png',
  './img/memes/congrats.png',
  './img/memes/congratulation.png',
  './img/memes/error.png',
  './img/memes/finished.png',
  './img/memes/good.png',
  './img/memes/google.png',
  './img/memes/group.png',
  './img/memes/helper.png',
  './img/memes/hero.png',
  './img/memes/i_break.png',
  './img/memes/i_saw.png',
  './img/memes/lazy.png',
  './img/memes/one_hour.png',
  './img/memes/pay.png',
  './img/memes/train.png',
  './img/memes/welcome.png',
  './img/memes/what_is_it.png',
  './img/memes/works.png',
  './img/memes/writing.png',
  './img/memes/walk.png',
];
