import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { CertificateTemplatePicker } from './CertificateTemplatePicker';

type Props = {
  open: boolean;
  studentName?: string;
  onCancel: () => void;
  onSubmit: (templateId: string) => void;
};

export function IssueCertificateModal({ open, studentName, onCancel, onSubmit }: Props) {
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) setTemplateId(undefined);
  }, [open]);

  return (
    <Modal
      title={studentName ? `Issue certificate — ${studentName}` : 'Issue certificate'}
      open={open}
      onCancel={onCancel}
      onOk={() => templateId && onSubmit(templateId)}
      okButtonProps={{ disabled: !templateId }}
      okText="Issue"
      width={520}
    >
      <CertificateTemplatePicker value={templateId} onChange={setTemplateId} />
    </Modal>
  );
}
