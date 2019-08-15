export const AUTH_TOKEN = process.env.RSSCHOOL_API_TOKEN || '';

const stage: any = process.env.STAGE || 'dev';

enum host {
  dev = 'localhost:3000',
  prod = 'app.rs.school',
}

export const REQUESTS = {
  getStudents: `http://${host[stage]}/api/course/1/externalAccounts`,
  getProfile: `http://${host[stage]}/api/profile?githubId=`,
  getTasks: `http://${host[stage]}/api/course/1/tasks`,
  updateScores: `http://${host[stage]}/api/course/1/scores`,
};
