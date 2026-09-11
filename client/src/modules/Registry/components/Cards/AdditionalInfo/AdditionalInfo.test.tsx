import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { UpdateUserDtoLanguagesEnum } from '@client/api';
import { LABELS } from '@client/modules/Registry/constants';
import { Course } from '@client/services/models';
import { AdditionalInfo } from './AdditionalInfo';

const courses = [
  {
    id: 1,
    name: 'test',
    startDate: new Date().toUTCString(),
    planned: true,
  },
] as Course[];

const mockValues = {
  preferedCourses: [1],
  languagesMentoring: [UpdateUserDtoLanguagesEnum.En],
  dataProcessing: 1,
  aboutMyself: "I'm Groot",
};

type Values = typeof mockValues;

const previousHandler = vi.fn();
const submitHandler = vi.fn();
const submitFailedHandler = vi.fn();

const renderAdditionalInfo = (values: Values) =>
  render(
    <Form initialValues={values} onFinish={submitHandler} onFinishFailed={submitFailedHandler}>
      <AdditionalInfo courses={courses} onPrevious={previousHandler} />
    </Form>,
  );

describe('AdditionalInfo', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render populated fields and navigation, then call only submitHandler', async () => {
    const user = userEvent.setup();
    renderAdditionalInfo(mockValues);

    expect(screen.getByText(LABELS.courses)).toBeInTheDocument();
    expect(screen.getByText(LABELS.aboutYourself)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();

    const button = await screen.findByRole('button', { name: /submit/i });

    expect(button).toBeInTheDocument();
    await user.click(button);

    expect(submitHandler).toHaveBeenCalled();
    expect(submitFailedHandler).not.toHaveBeenCalled();
  });

  test('should call only submitFailedHandler', async () => {
    const user = userEvent.setup();
    renderAdditionalInfo({ ...mockValues, dataProcessing: 0 });

    const button = await screen.findByRole('button', { name: /submit/i });

    await user.click(button);

    expect(submitHandler).not.toHaveBeenCalled();
    expect(submitFailedHandler).toHaveBeenCalled();
  });
});
