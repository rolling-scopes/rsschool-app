import { render, screen } from '@testing-library/react';
import { ResumeCourseDto } from 'api';
import { CoursesSection } from './index';

const courseWithFullData: ResumeCourseDto = {
    id: 1,
    name: 'JS/FE 2020Q1',
    fullName: 'Rolling Scopes School 2020 Q1: JavaScript/Front-end',
    certificateId: 'abc123',
    completed: true,
    totalScore: 100,
    locationName: 'Minsk',
    mentor: {
        id: 123,
        name: 'Mentor Name',
        githubId: 'mentor-github-id',
    },
    rank: 111,
};

const mockCourses = [
    courseWithFullData,
    {
        id: 2,
        fullName: 'Rolling Scopes School 2020 Q3: Node.js',
        rank: 222,
    },
    {
        id: 3,
        fullName: 'Rolling Scopes School 2020 Q1: Machine Learning',
        rank: 333,
    },
    {
        id: 4,
        fullName: 'Rolling Scopes School 2020 Q4: Android',
        rank: 444,
    },
] as ResumeCourseDto[];

describe('CoursesSection', () => {
    test('should display nothing if courses are not provided', () => {
        const { container } = render(<CoursesSection courses={[]} visibleCourses={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('should display all course data correctly', () => {
        render(<CoursesSection courses={[courseWithFullData]} visibleCourses={[courseWithFullData.id]} />);

        const sectionHead = screen.getByRole('heading', { name: /rs school courses/i });
        const fullName = screen.getByText(`${courseWithFullData.fullName} (${courseWithFullData.locationName})`);
        const certificateIcon = screen.getByRole('img', { name: /safety\-certificate/i });
        const certificateLink = screen.getByRole('link', { name: /certificate/i });
        const mentorLink = screen.getByRole('link', { name: new RegExp(courseWithFullData.mentor?.name as string, 'i') });
        const position = screen.getByText(`Position: ${courseWithFullData.rank}`);
        const score = screen.getByText(`Score: ${courseWithFullData.totalScore}`);

        expect(sectionHead).toBeInTheDocument();
        expect(fullName).toBeInTheDocument();
        expect(certificateIcon).toBeInTheDocument();
        expect(certificateLink).toBeInTheDocument();
        expect(certificateLink).toHaveAttribute('href', `/certificate/${courseWithFullData.certificateId}`);
        expect(mentorLink).toBeInTheDocument();
        expect(mentorLink).toHaveAttribute('href', `https://github.com/${courseWithFullData.mentor?.githubId}`);
        expect(position).toBeInTheDocument();
        expect(score).toBeInTheDocument();
    });

    test('should display all courses if visible courses are empty', () => {
        render(<CoursesSection courses={mockCourses} visibleCourses={[]} />);

        mockCourses.forEach(({ fullName, rank }) => {
            const courseName = screen.getByText(fullName, { exact: false });
            const coursePosition = screen.getByText(`Position: ${rank}`);

            expect(courseName).toBeInTheDocument();
            expect(coursePosition).toBeInTheDocument();
        });
    });

    test('should display only visible courses if provided', () => {
        const mockVisibleCourses = [mockCourses[0].id, mockCourses[2].id];

        render(<CoursesSection courses={mockCourses} visibleCourses={mockVisibleCourses} />);

        mockCourses.forEach(({ id, fullName, rank }) => {
            if (mockVisibleCourses.includes(id)) {
                const courseName = screen.getByText(fullName, { exact: false });
                const coursePosition = screen.getByText(`Position: ${rank}`);

                expect(courseName).toBeInTheDocument();
                expect(coursePosition).toBeInTheDocument();
            } else {
                const courseName = screen.queryByText(fullName, { exact: false });
                const coursePosition = screen.queryByText(`Position: ${rank}`);

                expect(courseName).not.toBeInTheDocument();
                expect(coursePosition).not.toBeInTheDocument();

            }
        });
    });
});