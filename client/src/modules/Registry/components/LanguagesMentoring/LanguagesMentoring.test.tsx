import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { UpdateUserDtoLanguagesEnum } from '@client/api';
import { LABELS } from '@client/modules/Registry/constants';
import { LanguagesMentoring } from './LanguagesMentoring';

const mockValues = [UpdateUserDtoLanguagesEnum.En, UpdateUserDtoLanguagesEnum.Ru];

const renderLanguages = (isStudentForm = false) =>
  render(
    <Form initialValues={{ languagesMentoring: mockValues }}>
      <LanguagesMentoring isStudentForm={isStudentForm} />
    </Form>,
  );

describe('LanguagesMentoring', () => {
  test(`should render mentor languages and the "${LABELS.languagesMentor}" label`, async () => {
    renderLanguages();

    expect(await screen.findByLabelText(LABELS.languagesMentor)).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Russian')).toBeInTheDocument();
  });

  test(`should render field with "${LABELS.languagesStudent}" label on student form`, async () => {
    renderLanguages(true);

    const field = await screen.findByLabelText(LABELS.languagesStudent);
    expect(field).toBeInTheDocument();
  });
});
