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

export enum MentorRegistryTabsMode {
  New = 'new',
  All = 'all',
}
