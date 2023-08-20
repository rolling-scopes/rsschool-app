import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { PromptsPage } from 'modules/Prompts/pages/PromptPage';

export default function () {
  return (
    <SessionAndCourseProvider adminOnly>
      <PromptsPage />
    </SessionAndCourseProvider>
  );
}
