export const PAGINATION = 4;

export enum MentorsRegistryColumnKey {
  Github = 'githubId',
  Info = 'info',
  PreferredCourses = 'preferedCourses',
  ReceivedDate = 'receivedDate',
  Preselected = 'preselectedCourses',
  SendDate = 'sendDate',
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
  SendDate = 'Send',
  Tech = 'Technologies',
  Languages = 'Languages',
  StudentsLimit = 'Max students',
  City = 'City',
  PreferredLocation = 'Students Location',
  Actions = 'Actions',
}

export enum MentorRegistryTabsMode {
  New = 'new',
  All = 'all',
}

export const TABS = {
  [MentorRegistryTabsMode.New]: [
    MentorsRegistryColumnKey.Github,
    MentorsRegistryColumnKey.Info,
    MentorsRegistryColumnKey.PreferredCourses,
    MentorsRegistryColumnKey.Preselected,
    MentorsRegistryColumnKey.ReceivedDate,
    MentorsRegistryColumnKey.SendDate,
    MentorsRegistryColumnKey.Tech,
    MentorsRegistryColumnKey.City,
    MentorsRegistryColumnKey.Languages,
    MentorsRegistryColumnKey.StudentsLimit,
    MentorsRegistryColumnKey.Actions,
  ],
  [MentorRegistryTabsMode.All]: [
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
