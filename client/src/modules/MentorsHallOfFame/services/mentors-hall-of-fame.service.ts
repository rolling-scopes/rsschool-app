import { MentorsHallOfFameApi, TopMentorDto } from 'api';

const mentorsHallOfFameApi = new MentorsHallOfFameApi();

export class MentorsHallOfFameService {
  async getTopMentors(allTime = false): Promise<TopMentorDto[]> {
    const { data } = await mentorsHallOfFameApi.getTopMentors(allTime);
    return data;
  }
}
