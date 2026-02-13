import { Form, Modal, Spin, Typography } from 'antd';
import { MentorOptions, Options } from 'components/MentorOptions';
import React, { createContext, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { MentorDetailsDtoStudentsPreferenceEnum, MentorsApi } from 'api';
import { getMentorId } from 'domain/user';
import { Session } from 'components/withSession';

type Props = {
  course: { id: number; name: string };
  session: Session;
};

type MentorOptionsContextApi = {
  showMentorOptions: () => void;
};

export const MentorOptionsContext = createContext<MentorOptionsContextApi>({} as MentorOptionsContextApi);

export function MentorOptionsProvider({ children, course, session }: React.PropsWithChildren<Props>) {
  const [showModal, setShowModal] = useState(false);
  return (
    <MentorOptionsContext.Provider
      value={{
        showMentorOptions: () => setShowModal(true),
      }}
    >
      {children}
      {showModal && <MentorOptionsModal session={session} course={course} close={() => setShowModal(false)} />}
    </MentorOptionsContext.Provider>
  );
}

function MentorOptionsModal({ course, close, session }: Props & { close: () => void }) {
  const [options, setOptions] = useState<Options | null>(null);
  const [form] = Form.useForm();

  const mentorId = getMentorId(session, course.id);
  const { loading } = useAsync(async () => {
    if (!mentorId) {
      return;
    }
    const { data: mentor } = await new MentorsApi().getMentorOptions(mentorId, course.id);
    const { students, maxStudentsLimit, preferedStudentsLocation } = mentor;
    setOptions({
      maxStudentsLimit,
      preferedStudentsLocation: preferedStudentsLocation as MentorDetailsDtoStudentsPreferenceEnum,
      students: students.map(s => ({ value: s.id })),
      preselectedStudents: students,
    });
  });

  return (
    <Spin spinning={loading}>
      {!loading && (
        <Modal
          onCancel={close}
          okText="Confirm"
          destroyOnClose
          onOk={async () => {
            const values = await form.validateFields();
            if (values) {
              await new CourseService(course.id).createMentor(session.githubId, {
                maxStudentsLimit: values.maxStudentsLimit,
                preferedStudentsLocation: values.preferedStudentsLocation,
                students: values.students?.map((student: { value: number }) => Number(student.value)) ?? [],
              });
              close();
            }
          }}
          title={
            <>
              Mentorship options: <Typography.Text type="secondary">{course.name}</Typography.Text>
            </>
          }
          open
        >
          <Typography.Text>
            You have confirmed your desire to be a mentor in our course. Just in case you can change your preferences
            below and select student which you want to mentor.
          </Typography.Text>
          <MentorOptions form={form} showSubmitButton={false} mentorData={options} course={course} />
        </Modal>
      )}
    </Spin>
  );
}
