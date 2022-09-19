<template>
  <div class="admin">
    <div class="admin__aside">
      <div class="admin__nav">
        <div
          v-for="(page, index) in pages"
          :key="index"
          :class="['btn', { 'btn-primary': currentPage === index }, { 'btn-link': currentPage !== index }]"
          @click="currentPage = index"
        >
          {{ $t(`admin.btn.${page}`) }}
        </div>
      </div>
    </div>
    <div class="admin__main">
      <component :is="components[currentPage]" :id="components[currentPage]"></component>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import UsersList from '@/components/admin/UsersList.vue';
import GuessInfo from '@/components/profile/GuessInfo.vue';
import MemoryInfo from '@/components/profile/MemoryInfo.vue';
import { PAGINATION_OPTIONS } from '@/common/const';
import type { PageSettings } from '@/common/types';
import usePagination from '@/stores/pagination';
import useSearchText from '@/stores/search-text';
import useSortingList from '@/stores/sorting-list';
import useSelectedTags from '@/stores/tag-cloud';
import useCurrUser from '@/stores/curr-user';
import CatalogView from './Catalog.vue';
import SuggestionView from './Suggestion.vue';

const { setPerPage, setCurrPage } = usePagination();
const { setSearchText } = useSearchText();
const { setSelected } = useSelectedTags();
const { setSortingList } = useSortingList();

const { isAdmin } = useCurrUser();

export default defineComponent({
  name: 'AdminView',

  components: {
    CustomBtn,
    UsersList,
    CatalogView,
    SuggestionView,
    GuessInfo,
    MemoryInfo,
  },

  data() {
    return {
      currentPage: 0,
      pages: ['users', 'sloths', 'suggest', 'guess', 'memory'],
      components: ['UsersList', 'CatalogView', 'SuggestionView', 'GuessInfo', 'MemoryInfo'],
    };
  },

  beforeRouteLeave() {
    this.clearStore();
  },

  beforeRouteEnter(to, from, next) {
    if (!isAdmin) next('/404');
    next();
  },

  created() {
    this.clearStore();
  },

  methods: {
    clearStore() {
      const settings: PageSettings = {
        currPage: 1,
        perPage: PAGINATION_OPTIONS[0],
        searchText: '',
        selected: [] as string[],
        sorting: '',
        checked: [] as string[],
      };

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
.admin {
  display: flex;
  gap: 2rem;
  padding: 0 3rem;
  color: var(--color-text);
}

.admin__aside {
  width: 20rem;
}

.admin__nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin__main {
  width: 100%;
}
</style>
