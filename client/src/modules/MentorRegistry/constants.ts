import css from 'styled-jsx/css';

export const PAGINATION = 200;

export enum MentorsRegistryColumnKey {
  Github = 'githubId',
  Info = 'info',
  PreferredCourses = 'preferedCourses',
  ReceivedDate = 'receivedDate',
  Preselected = 'preselectedCourses',
  UpdatedDate = 'updatedDate',
  Tech = 'technicalMentoring',
  Languages = 'languagesMentoring',
  StudentsLimit = 'maxStudentsLimit',
  City = 'cityName',
  PreferredLocation = 'preferedStudentsLocation',
  Actions = 'actions',
}

export enum MentorsRegistryColumnName {
  Github = 'Github',
  Info = 'Additional',
  PreferredCourses = 'Preferred',
  ReceivedDate = 'Received',
  Preselected = 'Pre-Selected',
  UpdatedDate = 'Send',
  Tech = 'Technologies',
  Languages = 'Languages',
  StudentsLimit = 'Max students',
  City = 'City',
  PreferredLocation = 'Students Location',
  Actions = 'Actions',
}

export const TABS = {
  new: [
    MentorsRegistryColumnKey.Github,
    MentorsRegistryColumnKey.Info,
    MentorsRegistryColumnKey.PreferredCourses,
    MentorsRegistryColumnKey.Preselected,
    MentorsRegistryColumnKey.ReceivedDate,
    MentorsRegistryColumnKey.UpdatedDate,
    MentorsRegistryColumnKey.Tech,
    MentorsRegistryColumnKey.Languages,
    MentorsRegistryColumnKey.StudentsLimit,
    MentorsRegistryColumnKey.Actions,
  ],
  all: [
    MentorsRegistryColumnKey.Github,
    MentorsRegistryColumnKey.Info,
    MentorsRegistryColumnKey.PreferredCourses,
    MentorsRegistryColumnKey.Preselected,
    MentorsRegistryColumnKey.Tech,
    MentorsRegistryColumnKey.City,
    MentorsRegistryColumnKey.Languages,
    MentorsRegistryColumnKey.StudentsLimit,
    MentorsRegistryColumnKey.PreferredLocation,
    MentorsRegistryColumnKey.Actions,
  ],
};

export enum TabsMode {
  New = 'new',
  All = 'all',
}

export type MentorRegistryTabsMode = TabsMode.All | TabsMode.New;

export const mentorRegistryStyles = css`
  .info-icons {
    display: flex;
    justify-content: center;
  }

  .info-icons > div {
    margin-right: 8px;
  }

  :global(.icon-certificate svg) {
    width: 16px;
    height: 16px;
  }

  .icon-flag-uk {
    background-image: url(/static/images/united-kingdom.png);
    background-position: center;
    background-size: contain;
    width: 16px;
    height: 16px;
  }

  .icon-mentor {
    background-image: url(/static/svg/master-yoda.svg);
    background-position: center;
    background-size: contain;
    width: 16px;
    height: 16px;
  }
`;
