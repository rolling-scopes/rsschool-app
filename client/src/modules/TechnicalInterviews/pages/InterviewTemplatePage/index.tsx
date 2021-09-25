import { useRouter } from 'next/router';

export function InterviewTemplatePage() {
  const router = useRouter();
  const slug = router.query.slug || [];
  return <div>InterviewTemplatePage: Slug: {slug}</div>;
}
