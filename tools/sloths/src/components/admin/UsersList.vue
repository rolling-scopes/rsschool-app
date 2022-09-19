<template>
  <div class="users">
    <div class="users__aside list-aside">
      <custom-btn :text="$t('admin.users.btn.new')" className="btn btn-primary" @click="showUserInfoNew"></custom-btn>
      <list-controls
        @search="getUsers"
        @tags="getUsers"
        @sorting="getUsers"
        @clearAll="getUsers"
        :placeholder="$t('admin.search')"
        :tags="tags"
        :title="$t('admin.sorting')"
        :options="sortingOptions"
        :text="$t('btn.reset')"
      >
      </list-controls>
    </div>
    <div class="users__main list-main">
      <list-pagination :size="count" @getPage="getUsers"></list-pagination>
      <div class="users__list">
        <user-card
          v-for="user in users"
          :key="user.id"
          :userInfo="user"
          @delUser="delUser"
          @editUser="showUserInfoEdit"
          @showUser="showUserInfoView"
        ></user-card>
      </div>
      <user-modal
        :isUserInfoVisible="isUserInfoVisible"
        :headerText="getHeaderUserInfo"
        :modalEvents="modalEvents"
        @closeUserInfo="closeUserInfo"
        @createUser="createUser"
        @updUser="updUser"
      ></user-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { errorHandler } from '@/services/error-handling/error-handler';
import { PAGINATION_OPTIONS, USER_SORTING } from '@/common/const';
import { UsersService } from '@/services/users-service';
import type { PageSettings, User, Users } from '@/common/types';
import { ModalEvents } from '@/common/enums/modal-events';
import usePagination from '@/stores/pagination';
import useSearchText from '@/stores/search-text';
import useSelectedTags from '@/stores/tag-cloud';
import useSortingList from '@/stores/sorting-list';
import useUserInfo from '@/stores/user-info';
import useLoader from '@/stores/loader';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import ListControls from '@/components/list-controls/ListControls.vue';
import ListPagination from '@/components/list-controls/ListPagination.vue';
import { Role } from '@/common/enums/user-role';
import usePagesStore from '@/stores/pages-store';
import UserModal from './UserModal.vue';
import UserCard from './UserCard.vue';

const service = new UsersService();

const { setEmptyUserInfo, setUserInfo } = useUserInfo();

const { setPerPage, setCurrPage, getPerPage, getCurrPage } = usePagination();
const { setSearchText, getSearchText } = useSearchText();
const { setSelected, getSelected } = useSelectedTags();
const { setSortingList, getSortingList } = useSortingList();
const { getPageUsersState, setPageUsersState } = usePagesStore();

export default defineComponent({
  name: 'UsersList',

  components: {
    CustomBtn,
    UserCard,
    UserModal,
    ListControls,
    ListPagination,
  },

  data() {
    return {
      users: [] as Users,
      count: 0,
      isUserInfoVisible: false,
      modalEvents: ModalEvents.view,
      searchText: '',
      tags: [Role.admin, Role.user],
      sortingOptions: USER_SORTING,
    };
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),

    getHeaderUserInfo(): string {
      if (this.modalEvents === ModalEvents.new) return this.$t('admin.users.btn.new');
      if (this.modalEvents === ModalEvents.edit) return this.$t('btn.edit');
      return this.$t('admin.users.info');
    },
  },

  created() {
    this.loadStore();
  },

  async mounted() {
    await this.getUsers();
  },

  beforeUnmount() {
    const savedProps = {
      currPage: getCurrPage(),
      perPage: getPerPage(),
      searchText: getSearchText(),
      selected: getSelected(),
      sorting: getSortingList(),
    };
    setPageUsersState(JSON.stringify(savedProps));
  },

  methods: {
    async getUsers() {
      this.isLoad = true;
      try {
        const currPage = getCurrPage();
        const perPage = getPerPage();
        const searchText = getSearchText();
        const selected = getSelected();
        const sorting = getSortingList();

        const res = await service.getAll(currPage, perPage, sorting, searchText, selected.join(','));

        if (!res.ok) throw Error();

        this.users = res.data.items;
        this.count = res.data.count;
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async delUser(id: string) {
      this.isLoad = true;
      try {
        const res = await service.deleteById(id);

        if (!res.ok) throw Error();

        await this.getUsers();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async createUser(user: User) {
      this.isLoad = true;
      try {
        const res = await service.create(user);

        if (!res.ok) throw Error();

        await this.getUsers();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async updUser(user: User) {
      this.isLoad = true;
      try {
        const res = await service.updateById(user.id, user);

        if (!res.ok) throw Error();

        await this.getUsers();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    showUserInfoView(user: User) {
      this.modalEvents = ModalEvents.view;
      setUserInfo(user);
      this.showUserInfo();
    },

    showUserInfoNew() {
      this.modalEvents = ModalEvents.new;
      setEmptyUserInfo();
      this.showUserInfo();
    },

    showUserInfoEdit(user: User) {
      this.modalEvents = ModalEvents.edit;
      setUserInfo(user);
      this.showUserInfo();
    },

    showUserInfo() {
      this.isUserInfoVisible = true;
    },

    closeUserInfo() {
      this.isUserInfoVisible = false;
    },

    loadStore() {
      const settings: PageSettings = {
        currPage: 1,
        perPage: PAGINATION_OPTIONS[0],
        searchText: '',
        selected: [] as string[],
        sorting: USER_SORTING[0].value,
      };

      const str = getPageUsersState();
      if (str) {
        const data = JSON.parse(str);
        if (data) {
          settings.currPage = data.currPage;
          settings.perPage = data.perPage;
          settings.searchText = data.searchText;
          settings.selected = data.selected;
          settings.sorting = data.sorting;
        }
      }

      setCurrPage(settings.currPage);
      setPerPage(settings.perPage);
      setSearchText(settings.searchText);
      setSelected(settings.selected);
      setSortingList(settings.sorting);
    },
  },
});
</script>

<style scoped>
.users {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  color: var(--color-text);
}

.users__aside {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
}

.users__main {
  width: 100%;
}

.users__list {
  margin: 0.5em 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--gap);
}

@media (max-width: 1000px) {
  .users__aside {
    flex-direction: column;
  }
}
</style>
