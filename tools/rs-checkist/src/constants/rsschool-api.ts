export const AUTH_TOKEN = process.env.RSSCHOOL_API_TOKEN || '';

const stage: any = process.env.STAGE || 'dev';

enum host {
  dev = 'localhost:3000',
  prod = 'app.rs.school',
}

export const REQUEST_REPLACES = {
  COURSE_ID: 'COURSE_ID',
};

export const REQUESTS = {
  getCourses: `http://${host[stage]}/api/courses`,
  getStudents: `http://${host[stage]}/api/course/${REQUEST_REPLACES.COURSE_ID}/externalAccounts`,
  getProfile: `http://${host[stage]}/api/profile?githubId=`,
  getTasks: `http://${host[stage]}/api/course/${REQUEST_REPLACES.COURSE_ID}/tasks`,
  updateScores: `http://${host[stage]}/api/course/${REQUEST_REPLACES.COURSE_ID}/scores`,
};
