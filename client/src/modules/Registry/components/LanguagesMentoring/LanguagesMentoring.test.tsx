import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { UpdateUserDtoLanguagesEnum } from 'api';
import { LABELS } from 'modules/Registry/constants';
import { LanguagesMentoring } from './LanguagesMentoring';

const mockValues = [UpdateUserDtoLanguagesEnum.En, UpdateUserDtoLanguagesEnum.Ru];

const renderLanguages = (isStudentForm = false) =>
  render(
    <Form initialValues={{ languagesMentoring: mockValues }}>
      <LanguagesMentoring isStudentForm={isStudentForm} />
    </Form>,
  );

describe('LanguagesMentoring', () => {
  test(`should render field with "${LABELS.languages}" label on mentor form`, async () => {
    renderLanguages();

    const field = await screen.findByLabelText(LABELS.languages);
    expect(field).toBeInTheDocument();
  });

  test(`should render field with "${LABELS.languagesStudent}" label on student form`, async () => {
    renderLanguages(true);

    const field = await screen.findByLabelText(LABELS.languagesStudent);
    expect(field).toBeInTheDocument();
  });

  test.each`
    value
    ${UpdateUserDtoLanguagesEnum.En}
    ${UpdateUserDtoLanguagesEnum.Ru}
  `('should render pre-selected option with $value value', async ({ value }) => {
    renderLanguages();

    const option = await screen.findByText(value);
    expect(option).toBeInTheDocument();
  });
});
