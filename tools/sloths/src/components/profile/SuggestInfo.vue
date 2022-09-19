<template>
  <div class="game-info">
    <list-pagination :size="count" @getPage="getSuggestions"></list-pagination>
    <div class="game-info__list">
      <suggestion-card
        v-for="suggest in suggestions"
        :key="suggest.id"
        :suggestInfo="suggest"
        @showSuggest="showSuggestionInfoView"
      >
      </suggestion-card>
    </div>
    <suggestion-info
      :isSuggestInfoVisible="isSuggestionInfoVisible"
      :headerText="$t('suggest.info')"
      :modalEvents="modalEvents"
      @closeSuggestInfo="closeSuggestionInfo"
    ></suggestion-info>

    <div class="game-info__again">
      <home-category category="suggest" @click="$router.push({ name: 'suggest' })"></home-category>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapWritableState } from 'pinia';
import HomeCategory from '@/components/home/HomeCategory.vue';
import { SuggestionsService } from '@/services/suggestions-service';
import type { Suggestion, Suggestions } from '@/common/types';
import { errorHandler } from '@/services/error-handling/error-handler';
import ListPagination from '@/components/list-controls/ListPagination.vue';
import SuggestionCard from '@/components/suggest/SuggestionCard.vue';
import SuggestionInfo from '@/components/suggest/SuggestionInfo.vue';
import useLoader from '@/stores/loader';
import usePagination from '@/stores/pagination';
import useSuggestionInfo from '@/stores/suggestion-info';
import { ModalEvents } from '@/common/enums/modal-events';
import useCurrUser from '@/stores/curr-user';

const service = new SuggestionsService();

const { setSuggestionInfo } = useSuggestionInfo();

const { getPerPage, getCurrPage } = usePagination();

export default defineComponent({
  name: 'SuggestInfo',

  components: {
    HomeCategory,
    SuggestionCard,
    SuggestionInfo,
    ListPagination,
  },

  data() {
    return {
      suggestions: [] as Suggestions,
      count: 0,
      isSuggestionInfoVisible: false,
      modalEvents: ModalEvents.view,
    };
  },

  props: {
    userId: {
      type: String,
      default: '',
    },
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),
    ...mapState(useCurrUser, ['getUserId']),
  },

  mounted() {
    this.getSuggestions();
  },

  methods: {
    async getSuggestions() {
      this.isLoad = true;
      try {
        const currPage = getCurrPage();
        const perPage = getPerPage();

        const res = await service.getAll(currPage, perPage, 'createdAt-desc', '', '', this.getUserId);

        if (!res.ok) throw Error(); // todo

        this.suggestions = res.data.items;
        this.count = res.data.count;
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

    showSuggestionInfo() {
      this.isSuggestionInfoVisible = true;
    },

    closeSuggestionInfo() {
      this.isSuggestionInfoVisible = false;
    },
  },
});
</script>

<style scoped>
.game-info__list {
  margin: 0.5em 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--gap);
}
</style>
