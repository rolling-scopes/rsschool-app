import {
  emailPattern,
  epamEmailPattern,
  englishNamePattern,
  phonePattern,
  urlWithIpPattern,
  notGithubPattern,
  githubPrUrl,
  githubRepoUrl,
  githubUsernamePattern,
  notUrlPattern,
  passwordPattern,
} from './validators';

describe('email pattern', () => {
  it.each`
    input             | match
    ${'a@b.c'}        | ${true}
    ${'a_b@epam.com'} | ${false}
    ${'a@b.cd'}       | ${true}
    ${'a@b'}          | ${false}
  `('returns $match for $input', ({ input, match }) => {
    expect(emailPattern.test(input)).toBe(match);
  });
});

describe('epam email pattern', () => {
  it.each`
    input             | match
    ${'a@b.c'}        | ${false}
    ${'a_b@epam.com'} | ${true}
    ${'a@b.cd'}       | ${false}
  `('returns $match for $input', ({ input, match }) => {
    expect(epamEmailPattern.test(input)).toBe(match);
  });
});

describe('english name pattern', () => {
  it.each`
    input     | match
    ${'abc'}  | ${true}
    ${'abc#'} | ${false}
    ${'abć'}  | ${false}
    ${'абв'}  | ${false}
  `('returns $match for $input', ({ input, match }) => {
    expect(englishNamePattern.test(input)).toBe(match);
  });
});

describe('phone pattern', () => {
  it.each`
    input             | match
    ${'+1234567890'}  | ${true}
    ${'+12345678901'} | ${false}
    ${'1234567890'}   | ${false}
    ${'+12'}          | ${false}
    ${'+0123'}        | ${false}
  `('returns $match for $input', ({ input, match }) => {
    expect(phonePattern.test(input)).toBe(match);
  });
});

describe('url with ip pattern', () => {
  it.each`
    url                                      | match
    ${'http://google.com'}                   | ${true}
    ${'https://google.com'}                  | ${true}
    ${'ftp://google.com'}                    | ${true}
    ${'http://192.168.1.1'}                  | ${true}
    ${'http://username:password@google.com'} | ${true}
    ${'not a url'}                           | ${false}
  `('returns $match for $url', ({ url, match }) => {
    expect(urlWithIpPattern.test(url)).toBe(match);
  });
});

describe('not github pattern', () => {
  it.each`
    url                     | match
    ${'https://google.com'} | ${true}
    ${'https://github.com'} | ${false}
    ${'not a url'}          | ${true}
  `('returns $match for $url', ({ url, match }) => {
    expect(notGithubPattern.test(url)).toBe(match);
  });
});

describe('github pr url', () => {
  it.each`
    url                                      | match
    ${'https://github.com/user/repo/pull/1'} | ${true}
    ${'https://github.com/user/repo'}        | ${false}
    ${'not a url'}                           | ${false}
  `('returns $match for $url', ({ url, match }) => {
    expect(githubPrUrl.test(url)).toBe(match);
  });
});

describe('github repo url', () => {
  it.each`
    url                                      | match
    ${'https://github.com/user/repo'}        | ${true}
    ${'https://github.com/user/repo/pull/1'} | ${false}
    ${'not a url'}                           | ${false}
  `('returns $match for $url', ({ url, match }) => {
    expect(githubRepoUrl.test(url)).toBe(match);
  });
});

describe('github username', () => {
  it.each`
    username                         | match
    ${'myrepository'}                | ${true}
    ${'https://github.com/username'} | ${false}
    ${'not my repo'}                 | ${false}
    ${'my-repository'}               | ${true}
    ${'-myrepository'}               | ${false}
    ${'myrepository-'}               | ${false}
  `('returns $match for $username', ({ username, match }) => {
    expect(githubUsernamePattern.test(username)).toBe(match);
  });
});

describe('not url pattern', () => {
  it.each`
    string         | match
    ${'/a/url'}    | ${false}
    ${'not a url'} | ${true}
  `('returns $match for $string', ({ string, match }) => {
    expect(notUrlPattern.test(string)).toBe(match);
  });
});

describe('password pattern', () => {
  it.each`
    password            | isValid
    ${'1234_abcd'}      | ${true}
    ${'5678_EFGH'}      | ${true}
    ${'_abcd'}          | ${false}
    ${'1234abcd'}       | ${false}
    ${'1234_abcd_efgh'} | ${false}
    ${'abc_1a2w'}       | ${false}
  `('returns $isValid for $password', ({ password, isValid }) => {
    expect(password.match(passwordPattern) !== null).toBe(isValid);
  });
});
