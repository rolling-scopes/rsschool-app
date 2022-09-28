import { render, screen } from '@testing-library/react';
import { ResumeDtoEnglishLevelEnum, ResumeDtoMilitaryServiceEnum } from 'api';
import { GeneralInfoForm } from './index';

const mockUserData = {
  notes: 'Some interesting facts about me lalala lalala lala',
  name: 'John Doe',
  selfIntroLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  militaryService: ResumeDtoMilitaryServiceEnum.NotLiable,
  avatarLink: 'https://example.com/avatar.jpg',
  desiredPosition: 'Cookies Engineer',
  englishLevel: ResumeDtoEnglishLevelEnum.A2,
  locations: 'Some, Loc, Ations',
  startFrom: '2022-09-26',
  fullTime: true,
};

describe('GeneralInfoForm', () => {
  test('should render form items with proper values', async () => {
    render(<GeneralInfoForm userData={mockUserData} />);

    const name = await screen.findByDisplayValue(mockUserData.name);
    const desiredPosition = await screen.findByDisplayValue(mockUserData.desiredPosition);
    const locations = await screen.findByDisplayValue(mockUserData.locations);
    const englishLevelValue = await screen.findByText(mockUserData.englishLevel);
    const militaryServiceValue = await screen.findByText('Not liable');
    const startFrom = await screen.findByDisplayValue(mockUserData.startFrom);
    const fullTime = await screen.findByRole('checkbox', { name: /ready to work full time/i });
    const avatarLink = await screen.findByDisplayValue(mockUserData.avatarLink);
    const selfIntroLink = await screen.findByDisplayValue(mockUserData.selfIntroLink);
    const notes = await screen.findByDisplayValue(mockUserData.notes);

    expect(name).toBeInTheDocument();
    expect(desiredPosition).toBeInTheDocument();
    expect(locations).toBeInTheDocument();
    expect(englishLevelValue).toBeInTheDocument();
    expect(militaryServiceValue).toBeInTheDocument();
    expect(startFrom).toBeInTheDocument();
    expect(fullTime).toBeChecked();
    expect(avatarLink).toBeInTheDocument();
    expect(selfIntroLink).toBeInTheDocument();
    expect(notes).toBeInTheDocument();
  });

  test('should render form items with proper labels', async () => {
    render(<GeneralInfoForm userData={mockUserData} />);

    const name = await screen.findByLabelText('Name');
    const desiredPosition = await screen.findByLabelText('Desired position');
    const locations = await screen.findByLabelText('Locations');
    const englishLevelSelect = await screen.findByLabelText('Select your English level');
    const englishLevelValue = await screen.findByText(ResumeDtoEnglishLevelEnum.A2);
    const militaryService = await screen.findByLabelText('Military service');
    const startFrom = await screen.findByLabelText('Ready to start work from');
    const fullTime = await screen.findByRole('checkbox', { name: /ready to work full time/i });
    const avatarLink = await screen.findByLabelText('Photo');
    const selfIntroLink = await screen.findByLabelText('Self introduction video');
    const notes = await screen.findByLabelText('About me');

    expect(name).toBeInTheDocument();
    expect(desiredPosition).toBeInTheDocument();
    expect(locations).toBeInTheDocument();
    expect(englishLevelSelect).toBeInTheDocument();
    expect(englishLevelValue).toBeInTheDocument();
    expect(militaryService).toBeInTheDocument();
    expect(startFrom).toBeInTheDocument();
    expect(fullTime).toBeChecked();
    expect(avatarLink).toBeInTheDocument();
    expect(selfIntroLink).toBeInTheDocument();
    expect(notes).toBeInTheDocument();
  });

  test('should render form items with proper placeholders', async () => {
    render(<GeneralInfoForm userData={mockUserData} />);

    const name = await screen.findByPlaceholderText('Enter your name');
    const desiredPosition = await screen.findByPlaceholderText('Enter desired position');
    const locations = await screen.findByPlaceholderText('Enter locations');
    const englishLevelSelect = await screen.findByPlaceholderText('Not selected yet');
    const militaryService = await screen.findByPlaceholderText('Not selected yet');
    const startFrom = await screen.findByPlaceholderText('Not selected yet');
    const avatarLink = await screen.findByPlaceholderText('Enter link to your photo');
    const selfIntroLink = await screen.findByPlaceholderText('Link to video with self introduction');
    const notes = await screen.findByPlaceholderText('Short info about you (50-1500 symbols)');

    expect(name).toBeInTheDocument();
    expect(desiredPosition).toBeInTheDocument();
    expect(locations).toBeInTheDocument();
    expect(englishLevelSelect).toBeInTheDocument();
    expect(militaryService).toBeInTheDocument();
    expect(startFrom).toBeInTheDocument();
    expect(avatarLink).toBeInTheDocument();
    expect(selfIntroLink).toBeInTheDocument();
    expect(notes).toBeInTheDocument();
  });
});
