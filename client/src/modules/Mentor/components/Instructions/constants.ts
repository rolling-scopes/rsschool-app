export const INSTRUCTIONS_TEXT = {
  title: "What's next?",
  description: 'No panic! information about students tasks for review will appear here.',
  steps: [
    {
      title: 'Wait for the distribution of students',
      // TODO: should be the links customizable for a course?
      html: "We haven't forgotten about you, don't worry. Make sure notifications are turned on. While you can read <a href='https://github.com/rolling-scopes-school/mentoring/tree/master/JS-FE-2022Q1' target='_blank'>this</a> information and subscribe to our communities:",
      links: [
        { title: 'github', url: 'https://github.com/rolling-scopes/rsschool-app' },
        { title: 'discord', url: 'https://discord.com/invite/PRADsJB' },
        { title: 'linkedin', url: 'https://www.linkedin.com/company/the-rolling-scopes-school/' },
        { title: 'telegram', url: 'https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ' },
      ],
    },
    {
      title: 'Interview with students',
      html: 'Wait for the distribution of students for the Screenings interview. You will receive an notification when students are appointed to the interview with you. From among them, choose for those whom you want to mentor. More details about the procedure can be found <a href="https://github.com/rolling-scopes-school/mentoring/blob/master/JS-FE-2021Q3/first-interview.md" target="_blank">here</a>.',
    },
    {
      title: "Check your students' tasks",
      html: 'Check tasks and set score for them. You can help students in every possible way in the process or check the final tasks only. It all depends on how you feel comfortable building the process. More details about the procedure can be found <a href="https://docs.app.rs.school/#/platform/pull-request-review-process" target="_blank">here</a>.',
    },
  ],
};
