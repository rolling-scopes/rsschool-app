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
    expect(filterLogin('https://github.com/Nastyasimanovich')).toBe('Nastyasimanovich');
    expect(filterLogin('https://github.com/Sergursevich')).toBe('Sergursevich');
  });

  it('Should return clear login if github-link with get parameters were passed', () => {
    expect(filterLogin('https://github.com/evsechicov?tab=repositories')).toBe('evsechicov');
    expect(filterLogin('https://github.com/evsechicov?tab=repositories/')).toBe('evsechicov');
    expect(filterLogin('http://github.com/evsechicov?tab=repositories')).toBe('evsechicov');
    expect(filterLogin('github.com/evsechicov?tab=repositories')).toBe('evsechicov');
  });

  it('Should return clear login if github-link with tail were passed', () => {
    expect(filterLogin('https://github.com/MikhamaZ/rsschool-cv')).toBe('MikhamaZ');
  });

  it('Should return an empty string when wrong github link were passed', () => {
    expect(filterLogin('https://github.com/')).toBe('');
    expect(filterLogin('https://github.com')).toBe('');
    expect(filterLogin('http://github.com')).toBe('');
    expect(filterLogin('github.com')).toBe('');
  });

  it('Should trim spaces', () => {
    expect(filterLogin('Ytniza ')).toBe('Ytniza');
    expect(filterLogin(' mikhama ')).toBe('mikhama');
    expect(filterLogin('        mikhama   ')).toBe('mikhama');
  });
});
