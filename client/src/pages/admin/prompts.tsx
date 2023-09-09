import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { PromptsPage } from 'modules/Prompts/pages/PromptPage';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <PromptsPage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
