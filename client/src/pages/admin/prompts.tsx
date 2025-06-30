import { SessionProvider } from 'modules/Course/contexts';
import { PromptsPage } from 'modules/Prompts/pages/PromptPage';

export default function () {
  return (
    <SessionProvider adminOnly>
      <PromptsPage />
    </SessionProvider>
  );
}
