import { Radio, Spin } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

type Template = {
  id: string;
  label: string;
  previewUrl: string;
};

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

const DEFAULT_TEMPLATE_ID = 'default';

let cachedTemplates: Template[] | null = null;
let inflight: Promise<Template[]> | null = null;

async function fetchTemplates(): Promise<Template[]> {
  if (cachedTemplates) return cachedTemplates;
  if (!inflight) {
    inflight = axios
      .get<Template[]>('/api/v2/certificate/templates')
      .then(res => {
        cachedTemplates = res.data;
        return cachedTemplates;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function CertificateTemplatePicker({ value, onChange }: Props) {
  const [templates, setTemplates] = useState<Template[]>(cachedTemplates ?? []);
  const [loading, setLoading] = useState(cachedTemplates == null);

  useEffect(() => {
    let cancelled = false;
    if (cachedTemplates) {
      setTemplates(cachedTemplates);
      setLoading(false);
      return;
    }
    fetchTemplates()
      .then(list => {
        if (cancelled) return;
        setTemplates(list);
      })
      .catch(() => {
        if (cancelled) return;
        setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (value == null && templates.length > 0) {
      const fallback = templates.find(t => t.id === DEFAULT_TEMPLATE_ID)?.id ?? templates[0]?.id;
      if (fallback) onChange?.(fallback);
    }
  }, [templates, value, onChange]);

  if (loading) {
    return <Spin />;
  }

  return (
    <Radio.Group
      value={value}
      onChange={e => onChange?.(e.target.value)}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: '100%' }}
    >
      {templates.map(t => {
        const selected = value === t.id;
        return (
          <Radio key={t.id} value={t.id} style={{ display: 'block', margin: 0 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 8,
                border: `2px solid ${selected ? '#1677ff' : '#d9d9d9'}`,
                borderRadius: 6,
                width: 180,
              }}
            >
              <img
                src={t.previewUrl}
                alt={t.label}
                style={{ width: 160, height: 110, objectFit: 'cover', background: '#fafafa' }}
              />
              <span style={{ fontSize: 12, textAlign: 'center' }}>{t.label}</span>
            </div>
          </Radio>
        );
      })}
    </Radio.Group>
  );
}
