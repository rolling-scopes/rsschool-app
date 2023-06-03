import { SoftSkillEntryIdEnum, SoftSkillEntryValueEnum } from 'api';

export const softSkills: { id: SoftSkillEntryIdEnum; name: string }[] = [
  {
    id: SoftSkillEntryIdEnum.Responsible,
    name: 'Responsible',
  },
  {
    id: SoftSkillEntryIdEnum.TeamPlayer,
    name: 'Good team player',
  },
  {
    id: SoftSkillEntryIdEnum.Communicable,
    name: 'Communicable',
  },
];

export const convertSoftSkillValueToEnum = (value: number | null) => {
  switch (value) {
    case 1:
      return SoftSkillEntryValueEnum.Poor;
    case 2:
      return SoftSkillEntryValueEnum.Fair;
    case 3:
      return SoftSkillEntryValueEnum.Good;
    case 4:
      return SoftSkillEntryValueEnum.Great;
    case 5:
      return SoftSkillEntryValueEnum.Excellent;
    default:
      return SoftSkillEntryValueEnum.None;
  }
};
