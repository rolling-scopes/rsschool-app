import { getQueryParams, getQueryString } from './queryParams-utils';

describe('queryParams', () => {
  describe('getQueryParams', () => {
    const initialQueryParams = { example: 'value' };

    it('Should be return initialQueryParams', () => {
      expect(getQueryParams).toBeInstanceOf(Function);
      expect(getQueryParams({})).toEqual({});
      expect(getQueryParams({}, initialQueryParams)).toEqual(initialQueryParams);
      expect(getQueryParams({ value: undefined }, initialQueryParams)).toEqual(initialQueryParams);
      expect(getQueryParams({ value: null }, initialQueryParams)).toEqual(initialQueryParams);
      expect(getQueryParams({ value: '' }, initialQueryParams)).toEqual(initialQueryParams);
      expect(getQueryParams({ value: [''] }, initialQueryParams)).toEqual(initialQueryParams);
    });

    it('Should be return initialQueryParams and newQueryParams', () => {
      const hello = 'hello';
      const newQueryParams = { b: 'string', c: [hello], ['more string']: 'string 12' };
      const expected = { ...newQueryParams, c: hello, ...initialQueryParams };

      expect(getQueryParams(newQueryParams)).toEqual({ ...newQueryParams, c: hello });
      expect(getQueryParams(newQueryParams, initialQueryParams)).toEqual(expected);
      expect(getQueryParams({ ...newQueryParams, value: undefined }, initialQueryParams)).toEqual(expected);
      expect(getQueryParams({ ...newQueryParams, value: null }, initialQueryParams)).toEqual(expected);
      expect(getQueryParams({ ...newQueryParams, value: '' }, initialQueryParams)).toEqual(expected);
      expect(getQueryParams({ ...newQueryParams, value: [''] }, initialQueryParams)).toEqual(expected);
    });
  });

  describe('getQueryString', () => {
    it('Should be return ""', () => {
      expect(getQueryString).toBeInstanceOf(Function);
      expect(getQueryString()).toBe('');
      expect(getQueryString({ value: undefined })).toBe('');
      expect(getQueryString({ value: null })).toBe('');
      expect(getQueryString({ value: '' })).toBe('');
    });

    it('Should be return correct string', () => {
      expect(getQueryString({ value: 'string' })).toBe('?value=string');
      expect(getQueryString({ value: 100 })).toBe('?value=100');
      expect(getQueryString({ value: true })).toBe('?value=true');
      expect(getQueryString({ value: false })).toBe('?value=false');
      expect(getQueryString({ value: [100] })).toBe('?value=100');
      expect(getQueryString({ value: [100, 'string'] })).toBe('?value=100%2Cstring');
      expect(getQueryString({ value: { b: 'string' } })).toBe('?value=%5Bobject+Object%5D');
      expect(getQueryString({ ['more value']: 100 })).toBe('?more+value=100');
    });
  });
});
