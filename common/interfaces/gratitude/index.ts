export interface IGratitudeGet {
  activist: boolean;
  badges: number;
  cityName: string;
  countryName: string;
  firstName: string;
  githubId: string;
  lastName: string;
  user_id: number;
}

export interface IGratitudeGetRequest {
  courseId: number;
  githubId: string;
  name: string;
  limit?: number;
  page?: number;
}
