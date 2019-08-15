export const EMPTY_UNIVERSITY = {
  id: '',
  name: '(Empty)',
};

export const EMPTY_FACULTY = {
  id: '',
  name: '(Empty)',
};

export const UNIVERSITIES = [
  {
    id: 'bsuir',
    name: 'BSUIR',
    faculties: [
      EMPTY_FACULTY,
      {
        id: 'bsuir-faculty-1',
        name: 'Faculty of Computer-Aided Design',
      },
      {
        id: 'bsuir-faculty-2',
        name: 'Faculty of Information Technologies And Control',
      },
      {
        id: 'bsuir-faculty-3',
        name: 'Faculty of Radioengineering And Electronics',
      },
      {
        id: 'bsuir-faculty-4',
        name: 'Faculty of Computer Systems And Networks',
      },
      {
        id: 'bsuir-faculty-5',
        name: 'Faculty of Infocommunications',
      },
      {
        id: 'bsuir-faculty-6',
        name: 'Faculty of Engineering And Economics',
      },
      {
        id: 'bsuir-faculty-7',
        name: 'Military Faculty',
      },
      {
        id: 'bsuir-faculty-8',
        name: 'Faculty of innovative lifelong learning ',
      },
      {
        id: 'bsuir-faculty-9',
        name: 'Faculty of Pre-university Preparation And Occupational Guidance',
      },
    ],
  },
  {
    id: 'bsu',
    name: 'BSU',
    faculties: [
      EMPTY_FACULTY,
      {
        id: 'bsu-faculty-1',
        name: 'Faculty of Applied Mathematics and Computer Science',
      },
      {
        id: 'bsu-faculty-2',
        name: 'Faculty of Biology',
      },
      {
        id: 'bsu-faculty-3',
        name: 'Faculty of Chemistry',
      },
      {
        id: 'bsu-faculty-4',
        name: 'Faculty of Economics',
      },
      {
        id: 'bsu-faculty-5',
        name: 'Faculty of Geography',
      },
      {
        id: 'bsu-faculty-6',
        name: 'Faculty of History',
      },
      {
        id: 'bsu-faculty-7',
        name: 'Faculty of International Relations',
      },
      {
        id: 'bsu-faculty-8',
        name: 'Faculty of Law',
      },
      {
        id: 'bsu-faculty-9',
        name: 'Faculty of Social and Cultural Communications',
      },
      {
        id: 'bsu-faculty-10',
        name: 'Faculty of Mathematics and Mechanics',
      },
      {
        id: 'bsu-faculty-11',
        name: 'Faculty of Philology',
      },
      {
        id: 'bsu-faculty-12',
        name: 'Faculty of Philosophy and Social Studies',
      },
      {
        id: 'bsu-faculty-13',
        name: 'Faculty of Physics',
      },
      {
        id: 'bsu-faculty-14',
        name: 'Faculty of Pre-University Education',
      },
      {
        id: 'bsu-faculty-15',
        name: 'Faculty of Radiophysics and Computer Technologies',
      },
      {
        id: 'bsu-faculty-16',
        name: 'Military Faculty',
      },
    ],
  },
  {
    id: 'bntu',
    name: 'BNTU',
    faculties: [
      {
        id: 'bntu-faculty-1',
        name: 'Automotive and Tractor Faculty',
      },
      {
        id: 'bntu-faculty-2',
        name: 'Mining Engineering and Engineering Ecology Faculty',
      },
      {
        id: 'bntu-faculty-3',
        name: 'Mechanical Engineering Faculty',
      },
      {
        id: 'bntu-faculty-4',
        name: 'Mechanics and Technology Faculty',
      },
      {
        id: 'bntu-faculty-5',
        name: 'Marketing, Management and Entrepreneurship Faculty',
      },
      {
        id: 'bntu-faculty-1',
        name: 'Power Engineering Faculty',
      },
      {
        id: 'bntu-faculty-6',
        name: 'Information Technologies and Robotics Faculty',
      },
      {
        id: 'bntu-faculty-7',
        name: 'Management Technologies and Humanitarization Faculty',
      },
      {
        id: 'bntu-faculty-8',
        name: 'Engineering and Pedagogy Faculty',
      },
      {
        id: 'bntu-faculty-9',
        name: 'Power Plant Construction and Engineering Services Faculty',
      },
      {
        id: 'bntu-faculty-10',
        name: 'Architectural Faculty',
      },
      {
        id: 'bntu-faculty-11',
        name: 'Civil Engineering Faculty',
      },
      {
        id: 'bntu-faculty-12',
        name: 'Instrumentation Engineering Faculty',
      },
      {
        id: 'bntu-faculty-13',
        name: 'Transport Communications Faculty',
      },
      {
        id: 'bntu-faculty-14',
        name: 'Military and Technical Faculty',
      },
      {
        id: 'bntu-faculty-15',
        name: 'Sports and Technical Faculty',
      },
    ],
  },
];

const range = (start: number, count: number): number[] => {
  return (Array.apply(0, Array(count)) as number[]).map((_: number, index: number) => {
    return index + start;
  });
};
const graduationOffset = 20;
const startYear = new Date().getFullYear() - graduationOffset;
export const EDUCATION_YEARS = range(startYear, graduationOffset + 6).map((year: number) => ({
  id: year.toString(),
  name: year.toString(),
}));
