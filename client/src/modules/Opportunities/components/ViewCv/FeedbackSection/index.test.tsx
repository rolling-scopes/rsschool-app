import { render, screen } from '@testing-library/react';
import { FeedbackDto, FeedbackSoftSkillIdEnum, FeedbackSoftSkillValueEnum } from '@client/api';
import { FeedbackSection } from './index';

const mockFeedback = {
  date: '2022-09-29T12:12:28.228Z',
  recommendationComment: 'Recommendation comment',
  englishLevel: 'A1',
  suggestions: 'Suggestion 1, Suggestion 2',
  mentor: {
    id: 1,
    name: 'Mentor Name',
    githubId: 'mentor-github-id',
  },
  softSkills: [
    {
      id: FeedbackSoftSkillIdEnum.Communicable,
      value: FeedbackSoftSkillValueEnum.Excellent,
    },
    {
      id: FeedbackSoftSkillIdEnum.Responsible,
      value: FeedbackSoftSkillValueEnum.Great,
    },
    {
      id: FeedbackSoftSkillIdEnum.TeamPlayer,
      value: FeedbackSoftSkillValueEnum.Poor,
    },
  ],
  course: {
    id: 1,
    name: 'Course Name',
  },
} as FeedbackDto;

describe('FeedbackSection', () => {
  test('should display nothing if feedback is not provided', () => {
    const { container } = render(<FeedbackSection data={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display feedback if provided', () => {
    render(<FeedbackSection data={[mockFeedback]} />);

    const sectionHeading = screen.getByRole('heading', { name: /mentor's feedback/i });
    const mentorLink = screen.getByRole('link', {
      name: new RegExp(mockFeedback.mentor.name, 'i'),
    });
    const courseName = screen.getByText(new RegExp(mockFeedback.course.name, 'i'));
    const recommendation = screen.getByText('Recommend To Hire');
    const recommendationComment = screen.getByText(mockFeedback.recommendationComment);
    const suggestions = screen.getByText(mockFeedback.suggestions);
    const englishLevel = screen.getByText(mockFeedback.englishLevel);
    const communicationSkill = screen.getByText('Communication: Excellent');
    const responsibilitySkill = screen.getByText('Responsibility: Great');
    const teamPlayerSkill = screen.getByText('Team Player: Poor');

    expect(sectionHeading).toBeInTheDocument();
    expect(mentorLink).toBeInTheDocument();
    expect(courseName).toBeInTheDocument();
    expect(recommendation).toBeInTheDocument();
    expect(recommendationComment).toBeInTheDocument();
    expect(suggestions).toBeInTheDocument();
    expect(englishLevel).toBeInTheDocument();
    expect(communicationSkill).toBeInTheDocument();
    expect(responsibilitySkill).toBeInTheDocument();
    expect(teamPlayerSkill).toBeInTheDocument();
  });
});
