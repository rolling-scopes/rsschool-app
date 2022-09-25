<template>
  <div class="game-info">
    <div class="game-info__title">{{ $t('results.user') }}</div>
    <div class="game-info__btns">
      <custom-btn
        v-for="(indexAll, index) in sortingOptions"
        :key="index"
        :text="$t(sortingOptionsALL[indexAll].text)"
        className="btn btn-primary"
        @click="setSorting(index)"
      ></custom-btn>
    </div>

    <div class="game-info__wrap">
      <div
        class="game-info__level game-info__level_admin"
        v-for="(res, index) in gameResults"
        :key="index"
      >
        <h4 class="result__level__title">{{ $t(`memory.${res.level}`) }}</h4>
        <div class="game-info__result" v-for="(r, i) in res.results" :key="r.gameId">
          <span class="result__index">{{ `${i + 1}.` }}</span>
          <span class="result__steps">{{ `${r.count} ${getStepsText(r.count)}` }}</span>
          <span class="result__time">{{ `${r.time / 1000} s` }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapWritableState } from 'pinia';
import HomeCategory from '@/components/home/HomeCategory.vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import { ruNounEnding } from '@/utils/ru-noun-ending';
import { GAME_RESULT_SORTING, MEMORY_LEVELS } from '@/common/const';
import type { GameResult, MemoryLevel, GameResults } from '@/common/types';
import useLoader from '@/stores/loader';

type MemoryLevelResult = MemoryLevel & { count: number; results: GameResult[] };

export default defineComponent({
  name: 'MemoryInfo',

  components: {
    HomeCategory,
    CustomBtn,
  },

  data() {
    return {
      gameResults: [] as MemoryLevelResult[],
      sortingOptionsALL: GAME_RESULT_SORTING,
      sortingOptions: [] as number[],
      sorting: 0,
    };
  },

  props: {
    userId: {
      type: String,
      default: '',
    }
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),

    isAdmin() {
      return this.$route.name === 'admin';
    },

    isMemory() {
      return this.$route.name === 'memory';
    },
  },

  async mounted() {
    this.getGameInfo();

    this.sortingOptions = this.sortingOptionsALL.map((el, i) => i).filter((el) => el % 2 === 0);

  },

  methods: {
    getGameInfo() {
      MEMORY_LEVELS.forEach((item) => {
        let levelRecords: GameResults = [];
        const levelData = localStorage.getItem(`rs-sloths-memory-${item.level}`);

        if (levelData) {
          levelRecords = JSON.parse(levelData);
        }

        this.gameResults.push({
          level: item.level,
          n: item.n,
          gameId: item.gameId,
          count: levelRecords.length,
          results: levelRecords
        });
      });
    },

    getStepsText(val: number): string {
      return ruNounEnding(val, this.$t('memory.steps1'), this.$t('memory.steps2'), this.$t('memory.stepsN'));
    },

    setSorting(i: number) {
      if (this.sortingOptions[i] % 2 === 0) {
        this.sortingOptions[i] += 1;
      } else {
        this.sortingOptions[i] -= 1;
      }

      this.sorting = this.sortingOptions[i];

      this.getGameInfo();
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

.game-info__wrap {
  display: flex;
  gap: 2rem;
}

.game-info__level {
  width: 25rem;
  min-height: 25rem;
  max-height: 34rem;
  overflow-y: auto;
  border-radius: 1rem;
  border: 0.2rem solid var(--color-border-inverse);
  background-color: var(--color-background-opacity);
  color: var(--color-text);
  transition: 0.5s ease;
}

.game-info__level_admin {
  width: 37rem;
}

.result__level__title {
  text-align: center;
  padding: 1rem;
  font-size: 2.4rem;
  transition: 0.5s ease;
}

.game-info__result {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-text);
  transition: 0.5s ease;
}

.result__index {
  width: 3rem;
}

.result__user {
  width: 11rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result__steps {
  flex: 1;
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

  .game-info__wrap {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
