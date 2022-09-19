<template>
  <div class="suggest" :class="isAdmin ? 'suggest_admin' : ''">
    <div class="suggest__tools">
      <custom-btn
        :text="mode === 'watch' ? `${$t('suggest.btn.switch.to-new')}` : `${$t('suggest.btn.switch.to-watch')}`"
        className="btn btn-primary"
        @click="handleSwitchMode"
        v-show="getPageName !== 'admin'"
      ></custom-btn>
    </div>
    <div v-if="mode === 'watch'" class="suggest__watch">
      <div class="suggest__aside list-aside">
        <list-controls
          @search="getSuggestions"
          @tags="getSuggestions"
          @sorting="getSuggestions"
          @clearAll="getSuggestions"
          :placeholder="$t('suggest.search')"
          :tags="tags"
          :title="$t('suggest.sorting')"
          :options="sortingOptions"
          :text="$t('btn.reset')"
        >
        </list-controls>
      </div>
      <div class="suggest__main list-main">
        <list-pagination :size="count" @getPage="getSuggestions"></list-pagination>
        <div class="suggest__list">
          <suggestion-card
            v-for="suggest in suggestions"
            :key="suggest.id"
            :suggestInfo="suggest"
            @editRating="updSuggestionRating"
            @delSuggest="delSuggestion"
            @editSuggest="showSuggestionInfoEdit"
            @showSuggest="showSuggestionInfoView"
          ></suggestion-card>
        </div>
        <suggestion-info
          :isSuggestInfoVisible="isSuggestionInfoVisible"
          :headerText="getHeaderSuggestionInfo"
          :modalEvents="modalEvents"
          @closeSuggestInfo="closeSuggestionInfo"
          @createSuggest="createSuggestion"
          @updSuggest="updSuggestion"
        ></suggestion-info>
      </div>
    </div>

    <suggestion-new v-else class="suggest__new" @create-suggest="createSuggestion"></suggestion-new>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import type { PageSettings, Suggestion, Suggestions } from '@/common/types';
import { errorHandler } from '@/services/error-handling/error-handler';
import { PAGINATION_OPTIONS, SUGGESTION_SORTING } from '@/common/const';
import { SuggestionsService } from '@/services/suggestions-service';
import { ModalEvents } from '@/common/enums/modal-events';
import useLoader from '@/stores/loader';
import usePagination from '@/stores/pagination';
import useSearchText from '@/stores/search-text';
import useSelectedTags from '@/stores/tag-cloud';
import useSortingList from '@/stores/sorting-list';
import useSuggestionInfo from '@/stores/suggestion-info';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import ListControls from '@/components/list-controls/ListControls.vue';
import ListPagination from '@/components/list-controls/ListPagination.vue';
import SuggestionCard from '@/components/suggest/SuggestionCard.vue';
import SuggestionInfo from '@/components/suggest/SuggestionInfo.vue';
import SuggestionNew from '@/components/suggest/SuggestionNew.vue';
import { SuggestionStatus } from '@/common/enums/suggestion-status';
import usePagesStore from '@/stores/pages-store';

const service = new SuggestionsService();

const { setEmptySuggestionInfo, setSuggestionInfo } = useSuggestionInfo();

const { getPerPage, getCurrPage, setPerPage, setCurrPage } = usePagination();
const { getSearchText, setSearchText } = useSearchText();
const { getSelected, setSelected } = useSelectedTags();
const { getSortingList, setSortingList } = useSortingList();
const { getPageSuggestionState, setPageSuggestionState } = usePagesStore();

export default defineComponent({
  name: 'SuggestionView',

  components: {
    CustomBtn,
    SuggestionCard,
    SuggestionInfo,
    ListControls,
    ListPagination,
    SuggestionNew,
  },

  data() {
    return {
      suggestions: [] as Suggestions,
      count: 0,
      isSuggestionInfoVisible: false,
      modalEvents: ModalEvents.view,
      searchText: '',
      tags: [SuggestionStatus.pending, SuggestionStatus.accepted, SuggestionStatus.decline],
      sortingOptions: SUGGESTION_SORTING,
      mode: 'watch',
    };
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),

    getPageName() {
      return this.$route.name === 'admin' ? 'admin' : 'suggest';
    },

    getHeaderSuggestionInfo() {
      if (this.modalEvents === ModalEvents.new) return this.$t('suggest.btn.new');
      if (this.modalEvents === ModalEvents.edit) return this.$t('btn.edit');
      return this.$t('suggest.info');
    },

    isAdmin() {
      return this.$route.name === 'admin';
    },
  },

  created() {
    this.loadStore();
  },

  async mounted() {
    await this.getSuggestions();
  },

  beforeUnmount() {
    const savedProps = {
      currPage: getCurrPage(),
      perPage: getPerPage(),
      searchText: getSearchText(),
      selected: getSelected(),
      sorting: getSortingList(),
    };
    setPageSuggestionState(JSON.stringify(savedProps));
  },

  methods: {
    async getSuggestions() {
      this.isLoad = true;
      try {
        const currPage = getCurrPage();
        const perPage = getPerPage();
        const searchText = getSearchText();
        const selected = getSelected();
        const sorting = getSortingList();

        const res = await service.getAll(currPage, perPage, sorting, searchText, selected.join(','));

        if (!res.ok) throw Error(); // todo

        this.suggestions = res.data.items;
        this.count = res.data.count;
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async delSuggestion(id: string) {
      this.isLoad = true;
      try {
        const res = await service.deleteById(id);

        if (!res.ok) throw Error(); // todo

        await this.getSuggestions();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async createSuggestion(suggestion: Suggestion, file: File) {
      this.isLoad = true;
      try {
        const res = await service.createImage(suggestion, file);

        if (!res.ok) throw Error(); // todo

        await this.getSuggestions();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async updSuggestionRating(suggestion: Suggestion, rate: number) {
      this.isLoad = true;
      try {
        const res = await SuggestionsService.updateRatingById(suggestion.id, rate);

        if (!res.ok) throw Error(); // todo

        await this.getSuggestions();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async updSuggestion(suggestion: Suggestion) {
      this.isLoad = true;
      try {
        const res = await service.updateById(suggestion.id, suggestion);

        if (!res.ok) throw Error(); // todo

        await this.getSuggestions();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    showSuggestionInfoView(suggestion: Suggestion) {
      this.modalEvents = ModalEvents.view;
      setSuggestionInfo(suggestion);
      this.showSuggestionInfo();
    },

    showSuggestionInfoNew() {
      this.modalEvents = ModalEvents.new;
      setEmptySuggestionInfo();
      this.showSuggestionInfo();
    },

    showSuggestionInfoEdit(suggestion: Suggestion) {
      this.modalEvents = ModalEvents.edit;
      setSuggestionInfo(suggestion);
      this.showSuggestionInfo();
    },

    showSuggestionInfo() {
      this.isSuggestionInfoVisible = true;
    },

    closeSuggestionInfo() {
      this.isSuggestionInfoVisible = false;
    },

    handleSwitchMode() {
      this.mode = this.mode === 'watch' ? 'new' : 'watch';
    },

    loadStore() {
      const settings: PageSettings = {
        currPage: 1,
        perPage: PAGINATION_OPTIONS[0],
        searchText: '',
        selected: [] as string[],
        sorting: SUGGESTION_SORTING[0].value,
      };

      const str = getPageSuggestionState();
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
.suggest {
  display: flex;
  flex-direction: column;
  padding: 0 3rem;
}

.suggest_admin {
  padding: 0;
}

.suggest__watch {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  color: var(--color-text);
}

.suggest_admin > .suggest__watch {
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.suggest__aside {
  margin: 0.5em;
}

.suggest_admin > .suggest__watch > .suggest__aside {
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0;
}

.suggest_admin > .suggest__watch > .suggest__aside,
.suggest_admin > .suggest__watch > .suggest__main {
  width: 100%;
  justify-content: center;
  align-items: center;
}

.suggest__list {
  margin: 0.5em 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--gap);
}

@media (max-width: 768px) {
  .suggest__watch {
    flex-direction: column;
  }
}
</style>
