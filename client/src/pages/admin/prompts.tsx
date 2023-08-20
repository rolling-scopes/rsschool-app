import { DefaultPageProvider } from 'modules/Course/contexts';
import { PromptsPage } from 'modules/Prompts/pages/PromptPage';

export default function () {
  return (
    <DefaultPageProvider adminOnly>
      <PromptsPage />
    </DefaultPageProvider>
  );
}
