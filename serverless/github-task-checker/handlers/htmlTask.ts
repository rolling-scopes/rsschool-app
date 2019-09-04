import chromium from 'chrome-aws-lambda';
import { tests } from '../htmlTaskTests';

declare const mocha: any;
declare const prepareSpec: any;

interface TestError {
  url: string;
  error?: string;
}

interface TestResult {
  url: string;
  passes: number;
  failures: number;
  duration: string;
  details?: string[];
}

const formatResults = (pageUrl: string, results: string): TestResult => {
  enum PatternPart {
    passes = 1,
    failures,
    duration,
  }
  let result: any = null;
  const short_result = results.match(/passes: (\d+)\nfailures: (\d+)\nduration: (.+)\n/);
  if (short_result) {
    result = {
      url: pageUrl,
      passes: <number>(<any>short_result[PatternPart.passes]),
      failures: <number>(<any>short_result[PatternPart.failures]),
      duration: short_result[PatternPart.duration],
    };
    if (short_result[PatternPart.failures] !== '0') {
      const assertionErrors = results.match(/(should .*) ‣\nAssertionError/g);
      const details = (assertionErrors || []).map(info => info.replace(' ‣\nAssertionError', ''));
      result = { ...(<object>result), details };
    }
  }
  return result;
};

const closeBrowserByException = async (browser, pageUrl, errorNumber): Promise<TestError> => {
  await browser.close();
  let result: TestError = { url: pageUrl };
  switch (errorNumber) {
    case 404:
      result = { ...result, error: 'Page Not Found' };
      break;
    case 523:
    default:
      result = { ...result, error: 'Origin Is Unreachable' };
      break;
  }
  return result;
};

export const runTests = async (pageUrl: string, spec: string): Promise<TestResult | TestError> => {
  const browser = await chromium.puppeteer.launch();
  const page = await browser.newPage();

  let openError: boolean = false;
  await page.goto(pageUrl).catch(error => {
    openError = error.message;
  });
  if (openError) return closeBrowserByException(browser, pageUrl, 523);

  let error404: boolean = false;
  await page.addScriptTag({ url: 'https://unpkg.com/chai@4.1.2/chai.js' }).catch(e => (error404 = true));
  await page.addScriptTag({ url: 'https://unpkg.com/mocha@4.0.1/mocha.js' }).catch(e => (error404 = true));
  await page.addScriptTag({ content: `;var prepareSpec = ${tests[spec]};` }).catch(e => (error404 = true));
  if (error404) return closeBrowserByException(browser, pageUrl, 404);

  await page.evaluate(async () => {
    const body = document.querySelector('body')!;
    const mocha_div = document.createElement('div');
    mocha_div.setAttribute('id', 'mocha');
    body.appendChild(mocha_div);
    mocha.setup('bdd');
    await prepareSpec();
    await mocha.run();
  });
  const report: string = await page.$eval('#mocha', (e: HTMLElement) => e.innerText);
  await browser.close();
  return formatResults(pageUrl, report);
};
