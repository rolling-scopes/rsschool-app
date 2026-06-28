import { render, screen } from '@testing-library/react';
import { UserData } from '@client/modules/Opportunities/models';
import { getPersonalToRender } from '@client/modules/Opportunities/data/getPersonalToRender';
import { PersonalSection } from './index';

vi.mock('@client/modules/Opportunities/data/getPersonalToRender');

describe('PersonalSection', () => {
  test('should display nothing if user data is not provided', () => {
    const { container } = render(<PersonalSection user={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display personal data if provided', () => {
    const mockData = [
      {
        title: 'Title 1',
        value: 'Value 1',
      },
      {
        title: 'Title 2',
        value: 'Value 2',
      },
      {
        title: 'Title 3',
        value: 'Value 3',
      },
    ];
    vi.mocked(getPersonalToRender).mockReturnValue(mockData);

    render(<PersonalSection user={{} as UserData} />);

    mockData.forEach(({ title, value }) => {
      const titleElement = screen.getByText(title);
      const valueElement = screen.getByText(value);

      expect(titleElement).toBeInTheDocument();
      expect(valueElement).toBeInTheDocument();
    });
  });
});
