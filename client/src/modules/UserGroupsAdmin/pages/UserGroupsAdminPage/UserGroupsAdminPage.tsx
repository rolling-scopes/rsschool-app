import { Button, Layout, message } from 'antd';
import { useCallback, useState } from 'react';
import { UserGroupDto, UpdateUserGroupDto } from '@client/api';
import { AdminPageLayout } from '@client/shared/components/PageLayout';
import { UserGroupsTable } from '../../components/UserGroupsTable';
import { UserGroupsModal } from '../../components/UserGroupsModal';
import { useUserGroups } from '../../hooks/useUserGroups';
import { useActiveCourseContext } from 'modules/Course/contexts';

const { Content } = Layout;

enum ModalAction {
  update = 'update',
  create = 'create',
}

export function UserGroupsAdminPage() {
  const { courses } = useActiveCourseContext();
  const { data, loading, loadUsers, createUserGroup, updateUserGroup, deleteUserGroup } = useUserGroups();
  const [modalData, setModalData] = useState<Partial<UserGroupDto> | null>(null);
  const [modalAction, setModalAction] = useState(ModalAction.update);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAddItem = () => {
    setModalData({});
    setModalAction(ModalAction.create);
  };

  const handleEditItem = (record: UserGroupDto) => {
    setModalData(record);
    setModalAction(ModalAction.update);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteUserGroup(id);
    } catch {
      message.error('Failed to delete user group. Please try later.');
    }
  };

  const handleModalSubmit = useCallback(
    async (values: UpdateUserGroupDto) => {
      try {
        if (modalLoading) {
          return;
        }
        setModalLoading(true);
        if (modalAction === ModalAction.update) {
          await updateUserGroup(modalData!.id!, values);
        } else {
          await createUserGroup(values);
        }
        setModalData(null);
      } catch {
        message.error('An error occurred. Cannot save user group.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalAction, modalData, modalLoading, createUserGroup, updateUserGroup],
  );

  function getInitialValues(modalData: Partial<UserGroupDto>) {
    return {
      ...modalData,
      users: modalData.users?.map(user => user.id) ?? [],
    };
  }

  return (
    <AdminPageLayout title="Manage User Groups" loading={loading} courses={courses}>
      <Content style={{ margin: 8 }}>
        <Button type="primary" onClick={handleAddItem}>
          Add User Group
        </Button>
        <UserGroupsTable data={data} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      </Content>
      <UserGroupsModal
        data={modalData}
        title="User Group"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
        loadUsers={loadUsers}
      />
    </AdminPageLayout>
  );
}
