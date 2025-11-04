export function InterviewerWidget({ interviewer }: { interviewer: { name: string; githubId: string } }) {
  return (
    <p style={{ marginBottom: '1em' }}>
      Interviewer: <a href={`/profile?githubId=${interviewer.githubId}`}>{interviewer.name}</a>
    </p>
  );
}
