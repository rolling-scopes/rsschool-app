import {
  CERTIFICATE_TEMPLATES,
  CERTIFICATE_TEMPLATE_IDS,
  DEFAULT_CERTIFICATE_TEMPLATE_ID,
  resolveCertificateTemplateId,
} from './catalog';

describe('certificate templates catalog', () => {
  describe('CERTIFICATE_TEMPLATE_IDS', () => {
    it('contains exactly the ids declared in CERTIFICATE_TEMPLATES', () => {
      expect([...CERTIFICATE_TEMPLATE_IDS].sort()).toEqual(CERTIFICATE_TEMPLATES.map(t => t.id).sort());
    });

    it('includes the default template id', () => {
      expect(CERTIFICATE_TEMPLATE_IDS.has(DEFAULT_CERTIFICATE_TEMPLATE_ID)).toBe(true);
    });
  });

  describe('DEFAULT_CERTIFICATE_TEMPLATE_ID', () => {
    it('is "default"', () => {
      expect(DEFAULT_CERTIFICATE_TEMPLATE_ID).toBe('default');
    });
  });

  describe('resolveCertificateTemplateId', () => {
    it('returns the input when it is a known template id', () => {
      expect(resolveCertificateTemplateId('default')).toBe('default');
      expect(resolveCertificateTemplateId('bootcamp_13_weeks')).toBe('bootcamp_13_weeks');
    });

    it('falls back to the default for an unknown string id', () => {
      expect(resolveCertificateTemplateId('not-a-template')).toBe(DEFAULT_CERTIFICATE_TEMPLATE_ID);
    });

    it('falls back to the default for an empty string', () => {
      expect(resolveCertificateTemplateId('')).toBe(DEFAULT_CERTIFICATE_TEMPLATE_ID);
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['number', 42],
      ['boolean', true],
      ['object', { id: 'default' }],
      ['array', ['default']],
    ])('falls back to the default for a non-string input (%s)', (_label, input) => {
      expect(resolveCertificateTemplateId(input)).toBe(DEFAULT_CERTIFICATE_TEMPLATE_ID);
    });
  });
});
