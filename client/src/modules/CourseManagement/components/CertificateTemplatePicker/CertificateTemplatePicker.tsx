import { FullscreenOutlined } from '@ant-design/icons';
import { Image, Radio, Spin, Tooltip } from 'antd';
import axios from 'axios';
import clsx from 'clsx';
import { cloneElement, useEffect, useRef, useState, type ReactElement } from 'react';
import styles from './CertificateTemplatePicker.module.css';

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
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    // State is already seeded from the module-level cache by the useState initializers above.
    if (cachedTemplates) {
      return;
    }
    let cancelled = false;
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
    if (value === undefined && templates.length > 0) {
      const fallback = templates.find(t => t.id === DEFAULT_TEMPLATE_ID)?.id ?? templates[0]?.id;
      if (fallback) onChangeRef.current?.(fallback);
    }
  }, [templates, value]);

  if (loading) {
    return <Spin />;
  }

  const openPreview = (e: React.MouseEvent, src: string) => {
    // Prevent the surrounding Radio from toggling selection when opening the preview.
    e.preventDefault();
    e.stopPropagation();
    setPreviewSrc(src);
  };

  return (
    <>
      <Radio.Group value={value} onChange={e => onChange?.(e.target.value)} className={styles.group}>
        {templates.map(t => {
          const selected = value === t.id;
          return (
            <Radio key={t.id} value={t.id} className={styles.radio}>
              <div className={clsx(styles.card, selected && styles.cardSelected)}>
                <div className={styles.thumb}>
                  <img src={t.previewUrl} alt={t.label} className={styles.thumbImg} />
                  <Tooltip title="View full preview">
                    <span
                      role="button"
                      aria-label="View full preview"
                      onClick={e => openPreview(e, t.previewUrl)}
                      onMouseDown={e => e.stopPropagation()}
                      className={styles.fullscreenBtn}
                    >
                      <FullscreenOutlined />
                    </span>
                  </Tooltip>
                </div>
                <span className={styles.label}>{t.label}</span>
              </div>
            </Radio>
          );
        })}
      </Radio.Group>

      <Image
        classNames={{ root: styles.hidden }}
        preview={{
          open: !!previewSrc,
          src: previewSrc,
          onOpenChange: open => {
            if (!open) setPreviewSrc(undefined);
          },
          // Open the preview almost full-screen so the certificate details are readable.
          imageRender: originalNode => {
            const node = originalNode as ReactElement<{ className?: string }>;
            return cloneElement(node, {
              className: clsx(node.props.className, styles.previewImg),
            });
          },
        }}
      />
    </>
  );
}
