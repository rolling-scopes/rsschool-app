export const CERTIFICATE_TEMPLATES = [
  {
    id: 'default',
    label: 'Default (Avenir, dark)',
    previewUrl: '/static/certificate-templates/default.svg',
  },
  {
    id: 'alt',
    label: 'Bootcamp (capybara, navy/gold)',
    previewUrl: '/static/certificate-templates/alt.jpg',
  },
] as const;

export type CertificateTemplate = (typeof CERTIFICATE_TEMPLATES)[number];
export type CertificateTemplateId = CertificateTemplate['id'];

export const CERTIFICATE_TEMPLATE_IDS: ReadonlySet<string> = new Set(
  CERTIFICATE_TEMPLATES.map(t => t.id),
);

export const DEFAULT_CERTIFICATE_TEMPLATE_ID: CertificateTemplateId = 'default';

export function resolveCertificateTemplateId(input: unknown): CertificateTemplateId {
  return typeof input === 'string' && CERTIFICATE_TEMPLATE_IDS.has(input)
    ? (input as CertificateTemplateId)
    : DEFAULT_CERTIFICATE_TEMPLATE_ID;
}
