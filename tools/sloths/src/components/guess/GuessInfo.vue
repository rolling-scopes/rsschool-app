<template>
  <div class="game-info">
    <div class="game-info__title">{{ $t('results.user') }}</div>
    <div class="game-info__btns">
      <custom-btn
        v-for="(indexAll, index) in sortingOptions"
        :key="`${index}_${sortingOptionsAll[indexAll].text}`"
        :text="$t(sortingOptionsAll[indexAll].text)"
        className="btn btn-primary"
        @click="setSorting(index)"
      ></custom-btn>
    </div>

    <div class="results results_admin">
      <div class="results__item" v-for="(res, index) in results" :key="`${index}_${res.count}`">
        <span class="result__index">{{ `${index + 1}.` }}</span>
        <span class="result__steps">{{ `${res.count} ${$t('guess.points', res.count)}` }}</span>
        <span class="result__time">{{ `${res.time / millisecondsInSecond} s` }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { GameResult } from '@/common/types';
import { defineComponent } from 'vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import { GAME_RESULT_SORTING, MILLISECONDS_IN_SECOND } from '@/common/const';
import useLoader from '@/stores/loader';
import { mapWritableState } from 'pinia';
import isEven from '@/utils/game-utils';
import sortMixins from '@/components/mixins/sort-mixin';

export default defineComponent({
  name: 'GuessInfo',

  mixins: [sortMixins],

  components: {
    CustomBtn,
  },

  data() {
    return {
      count: 0,
      results: [] as GameResult[],
      sortingOptionsAll: GAME_RESULT_SORTING,
      sortingOptions: [] as number[],
      sorting: 0,
    };
  },

  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),

    millisecondsInSecond(): number {
      return MILLISECONDS_IN_SECOND;
    },
  },

  watch: {
    isVisible() {
      this.getGameInfo();
      this.takeSort();
    },
  },

  async mounted() {
    this.getGameInfo();

    this.sortingOptions = this.sortingOptionsAll.map((el, i) => i).filter((el) => isEven(el));
  },

  methods: {
    getGameInfo() {
      const levelData = localStorage.getItem('rs-sloths-guess');

      if (levelData) {
        this.results = JSON.parse(levelData);
      }

      this.count = this.results.length;
    },

    setSorting(i: number) {
      if (isEven(this.sortingOptions[i])) {
        this.sortingOptions[i] += 1;
      } else {
        this.sortingOptions[i] -= 1;
      }

      this.sorting = this.sortingOptions[i];

      this.takeSort();
    },

    takeSort() {
      this.results.sort((a, b) => {
        const item1: number = this.sortTypes(this.sorting, a);
        const item2: number = this.sortTypes(this.sorting, b);

        return this.sortElems(item1, item2, this.sorting);
      });
    },
  },
});
</script>

<style scoped>
.game-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.game-info__title {
  padding-top: 1rem;
  color: var(--color-text);
  font-size: 2.4rem;
  transition: 0.5s ease;
}

.game-info__btns {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap);
}

.results {
  padding: 1rem;
  width: 28rem;
  min-height: 25rem;
  max-height: 34rem;
  overflow-y: auto;
  border-radius: 1rem;
  border: 0.2rem solid var(--color-border-inverse);
  background-color: var(--color-background-opacity);
  color: var(--color-text);
  transition: 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.results_admin {
  width: 40rem;
}

.results__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  color: var(--color-text);
}

.result__index {
  width: 3rem;
  font-weight: 700;
}

.result__user {
  width: 11rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result__steps {
  width: 8rem;
}

.result__time {
  width: 8rem;
}

.game-info__again {
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: 0.5s ease;
}

@media (max-width: 1200px) {
  .game-info__title {
    text-align: center;
  }

  .results,
  .game-info__again {
    justify-content: center;
  }
}
</style>
