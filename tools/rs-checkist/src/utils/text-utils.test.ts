import { filterLogin } from './text-utils';

describe('filterLogin', () => {
  it('Should be an instance of Function', () => {
    expect(filterLogin).toBeInstanceOf(Function);
  });

  it('Should return clear login if login were passed', () => {
    expect(filterLogin('mikhama/')).toBe('mikhama');
    expect(filterLogin('mikhama')).toBe('mikhama');
  });

  it('Should return clear login if github-link were passed', () => {
    expect(filterLogin('github.com/mikhama')).toBe('mikhama');
    expect(filterLogin('http://github.com/mikhama/')).toBe('mikhama');
    expect(filterLogin('http://github.com/mikhama')).toBe('mikhama');
    expect(filterLogin('https://github.com/mikhama')).toBe('mikhama');
    expect(filterLogin('https://github.com/NastyaTsimanovich97')).toBe('NastyaTsimanovich97');
    expect(filterLogin('https://github.com/Sergey-Xursevich')).toBe('Sergey-Xursevich');
  });

  it('Should return clear login if github-link with get parameters were passed', () => {
    expect(filterLogin('https://github.com/evseychicov?tab=repositories')).toBe('evseychicov');
    expect(filterLogin('https://github.com/evseychicov?tab=repositories/')).toBe('evseychicov');
    expect(filterLogin('http://github.com/evseychicov?tab=repositories')).toBe('evseychicov');
    expect(filterLogin('github.com/evseychicov?tab=repositories')).toBe('evseychicov');
  });

  it('Should return an empty string when wrong github link were passed', () => {
    expect(filterLogin('https://github.com/')).toBe('');
    expect(filterLogin('https://github.com')).toBe('');
    expect(filterLogin('http://github.com')).toBe('');
    expect(filterLogin('github.com')).toBe('');
  });

  it('Should trim spaces', () => {
    expect(filterLogin('Pytniza ')).toBe('Pytniza');
    expect(filterLogin(' mikhama ')).toBe('mikhama');
    expect(filterLogin('        mikhama   ')).toBe('mikhama');
  });
});
