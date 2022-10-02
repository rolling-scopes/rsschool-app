<template>
  <div class="game-field">
    <div class="game-field__tools">
      <div class="game-field__steps">
        <p>{{ steps }}</p>
      </div>
      <custom-btn
        :imgPath="`./img/memory/reload-${currTheme}.svg`"
        :text="$t('memory.start')"
        className="btn btn-memory"
        :disabled="steps === 0"
        :onClick="startGame"
      ></custom-btn>
    </div>
    <transition-group name="shuffle-list" tag="div" class="game-field__cards">
      <div
        class="game-field__card"
        :class="`game-field__card_${level.level}`"
        v-for="(item, index) in cards"
        :key="item.index"
        :item="item"
        @click="gameHandler(index)"
      >
        <transition name="flip" mode="out-in" @before-leave="isAnimated = true" @after-enter="isAnimated = false">
          <svg v-if="!getIsOpen(index)" alt="cover" class="game-field__img" :class="{ success: item.success }">
            <use :xlink:href="`${cardCover}#card-cover`"></use>
          </svg>
          <!-- <img v-else :src="getImage(index)" alt="card" class="game-field__img" :class="{ success: item.success }" /> -->
          <svg v-else :src="getImage(index)" alt="card" class="game-field__img" :class="{ success: item.success }">
            <use :xlink:href="getImage(index)"></use>
          </svg>
        </transition>
      </div>
    </transition-group>
    <modal-window v-show="getShowModal" @close="closeModal">
      <template v-slot:header> {{ $t('memory.congrats') }} </template>

      <template v-slot:body>
        <img :src="cardWinner" alt="winner" />
        <p>{{ $t('memory.win') }}</p>
        <p>{{ steps }} {{ getStepsText }}</p>
        <p>{{ getTime / 1000 }} {{ $t('memory.time') }}</p>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { mapWritableState } from 'pinia';
import { ruNounEnding } from '@/utils/ru-noun-ending';
import { MEMORY_GAME_COVER, MEMORY_GAME_TIMEOUT, MEMORY_GAME_WINNER, MEMORY_LEVELS } from '@/common/const';
import type { MemoryLevel, GameResult, GameResults } from '@/common/types';
import { defineComponent, type PropType } from 'vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import { playAudio, audioSlide, audioFlip, audioFail, audioSuccess, audioWin } from '@/utils/audio';
import themeProp from '../../stores/theme';

type Card = {
  img: string;
  index: number;
  id: number;
  open: boolean;
  success: boolean;
};

export default defineComponent({
  name: 'GameField',

  components: {
    CustomBtn,
    ModalWindow,
  },

  data() {
    return {
      cardCover: MEMORY_GAME_COVER,
      cardWinner: MEMORY_GAME_WINNER,
      images: [] as string[],
      cards: [] as Card[],
      activeCard: Infinity,
      steps: 0,
      startTime: 0,
      endTime: 0,
      grid: '1000px',
      isHandled: false,
      isAnimated: false,
      isModalVisible: false,
    };
  },

  props: {
    level: {
      type: Object as PropType<MemoryLevel>,
      default: MEMORY_LEVELS[1],
    },
  },

  computed: {
    ...mapWritableState(themeProp, ['currTheme']),

    getLevel(): string {
      return `memory.${this.level.level}`;
    },

    getStepsText(): string {
      return ruNounEnding(this.steps, this.$t('memory.steps1'), this.$t('memory.steps2'), this.$t('memory.stepsN'));
    },

    getTime(): number {
      return this.endTime - this.startTime;
    },

    getShowModal(): boolean {
      return this.isModalVisible && !this.isAnimated && !this.isHandled;
    },
  },

  mounted() {
    this.setGrid();
    this.getImages();
    this.startGame();
  },

  watch: {
    level() {
      this.setGrid();
      this.getCards();
      this.startGame();
    },
  },

  methods: {
    getImages() {
      this.images = [
        // './img/memory/memory01.svg',
        // './img/memory/memory02.svg',
        // './img/memory/memory03.svg',
        // './img/memory/memory04.svg',
        // './img/memory/memory05.svg',
        // './img/memory/memory06.svg',
        // './img/memory/memory07.svg',
        // './img/memory/memory08.svg',
        // './img/memory/memory09.svg',
        // './img/memory/memory10.svg',
        // './img/memory/memory11.svg',
        // './img/memory/memory12.svg',
        `${MEMORY_GAME_COVER}#memory01`,
        `${MEMORY_GAME_COVER}#memory02`,
        `${MEMORY_GAME_COVER}#memory03`,
        `${MEMORY_GAME_COVER}#memory04`,
        `${MEMORY_GAME_COVER}#memory05`,
        `${MEMORY_GAME_COVER}#memory06`,
        `${MEMORY_GAME_COVER}#memory07`,
        `${MEMORY_GAME_COVER}#memory08`,
        `${MEMORY_GAME_COVER}#memory09`,
        `${MEMORY_GAME_COVER}#memory10`,
        `${MEMORY_GAME_COVER}#memory11`,
        `${MEMORY_GAME_COVER}#memory12`,
      ];

      this.getCards();
    },

    getCards() {
      this.changeScrollHidden('hidden');
      this.cards = [];
      let index = 0;

      const images = this.images.sort(() => Math.random() - 0.5).filter((el, i) => i < this.level.n);

      images.forEach((el, i) => {
        this.cards.push({ img: el, id: i, index, open: false, success: false });
        index += 1;
        this.cards.push({ img: el, id: i, index, open: false, success: false });
        index += 1;
      });
      setTimeout(() => this.changeScrollHidden(''), MEMORY_GAME_TIMEOUT);
    },

    changeScrollHidden(val = '') {
      const mainEl: HTMLElement | null = document.querySelector('.main');
      if (mainEl instanceof HTMLElement) {
        mainEl.style.overflowY = val;
      }
    },

    startGame() {
      const isAllClosed = this.cards.every((el) => !el.open);

      if (!isAllClosed) {
        playAudio(audioFlip);
        this.cards.forEach((el, i) => this.closeCard(i));
      }

      this.activeCard = Infinity;
      this.steps = 0;
      this.startTime = 0;
      this.endTime = 0;

      if (isAllClosed) {
        playAudio(audioSlide);
        this.cards.sort(() => Math.random() - 0.5);
      } else {
        setTimeout(() => {
          playAudio(audioSlide);
          this.cards.sort(() => Math.random() - 0.5);
        }, MEMORY_GAME_TIMEOUT);
      }
      setTimeout(() => {
        playAudio(audioSlide);
        this.cards.sort(() => Math.random() - 0.5);
      }, MEMORY_GAME_TIMEOUT / 2);
    },

    getImage(i: number): string {
      return this.cards[i].img;
    },

    getIsOpen(i: number): boolean {
      return this.cards[i].open;
    },

    checkGameHandler(i: number): boolean {
      return !(this.cards[i].open || this.isHandled || this.isAnimated);
    },

    cardsNotMatched(i1: number, i2: number) {
      this.isHandled = true;

      setTimeout(() => {
        playAudio(audioFail);

        this.closeCard(i1);
        this.closeCard(i2);

        this.isHandled = false;
      }, MEMORY_GAME_TIMEOUT);
    },

    cardsMatched(i1: number, i2: number) {
      this.isHandled = true;

      setTimeout(() => {
        playAudio(audioSuccess);

        this.cards[i1].success = true;
        this.cards[i2].success = true;

        this.isHandled = false;
      }, MEMORY_GAME_TIMEOUT);
    },

    gameHandler(i: number) {
      if (this.startTime === 0) this.startTime = Date.now();

      if (!this.checkGameHandler(i)) return;

      playAudio(audioFlip);
      this.openCard(i);
      this.steps += 1;

      if (this.activeCard === Infinity) {
        this.activeCard = i;
      } else if (this.cards[i].id === this.cards[this.activeCard].id) {
        const i2 = this.activeCard;
        this.activeCard = Infinity;

        if (!this.isWin()) this.cardsMatched(i, i2);
      } else {
        const i2 = this.activeCard;
        this.activeCard = Infinity;

        this.cardsNotMatched(i, i2);
      }

      if (this.isWin()) {
        this.endTime = Date.now();

        setTimeout(() => {
          playAudio(audioWin);
          this.isModalVisible = true;
          this.saveResult();
        }, 0);
      }
    },

    isWin(): boolean {
      return this.cards.every((el) => el.open);
    },

    openCard(i: number) {
      this.cards[i].open = true;
    },

    closeCard(i: number) {
      this.cards[i].open = false;
      this.cards[i].success = false;
    },

    saveResult() {
      let currResults: GameResults = [];
      const savedRecords = localStorage.getItem(`rs-sloths-memory-${this.level.level}`);

      if (savedRecords) {
        currResults = JSON.parse(savedRecords);
      }

      const gameResult: GameResult = {
        gameId: this.level.gameId,
        count: this.steps,
        time: this.getTime,
        createdAt: (new Date).getTime()
      };

      currResults.unshift(gameResult)

      if (currResults.length > 10) {
        currResults.pop()
      }

      localStorage.setItem(`rs-sloths-memory-${this.level.level}`, JSON.stringify(currResults));
    },

    closeModal() {
      this.isModalVisible = false;
    },

    setGrid() {
      this.grid = this.level.n <= 4 ? '670px' : '1000px';
    },
  },
});
</script>

<style scoped>
.game-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.game-field__tools {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
}

.game-field__steps {
  width: 60px;
  height: 60px;
  font-size: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-inverse-soft);
  border-radius: 50%;
  color: var(--color-text-inverse);
  transition: 0.5s ease;
}

.game-field__cards {
  max-width: v-bind(grid);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1em;
}

.game-field__card {
  width: 150px;
  height: 200px;
  cursor: pointer;
  perspective: 600px;
}

.game-field__card_middle {
  width: 125px;
  height: 165px;
}

.game-field__card_senior {
  width: 100px;
  height: 133px;
}

.game-field__img {
  position: absolute;
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 1em;
  background-color: lightgray;
}

.game-field__img:hover {
  box-shadow: 0px 0px 5px var(--color-text);
}

@media (max-width: 1200px) {
  .game-field__card {
    width: 100px;
    height: 133px;
    cursor: pointer;
    perspective: 600px;
  }

  .game-field__card_middle {
    width: 70px;
    height: 94px;
  }

  .game-field__card_senior {
    width: 70px;
    height: 94px;
  }
}

.success {
  animation: rainbow 0.5s;
}

/* Animations */
.shuffle-list-move {
  transition: transform 0.6s;
}

.flip-enter-active {
  animation: flip-out 0.2s;
}

.flip-leave-active {
  animation: flip-in 0.2s;
}

@keyframes flip-in {
  0% {
    transform: rotateY(0deg);
    transform-style: preserve-3d;
  }
  100% {
    transform: rotateY(90deg);
    transform-style: preserve-3d;
  }
}

@keyframes flip-out {
  0% {
    transform: rotateY(270deg);
    transform-style: preserve-3d;
  }
  100% {
    transform: rotateY(360deg);
    transform-style: preserve-3d;
  }
}

@keyframes rainbow {
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px 5px rgb(255, 255, 0);
  }
  33% {
    transform: scale(1.05);
    box-shadow: 0 0 5px 5px rgba(0, 0, 255, 0.75);
  }
  66% {
    transform: scale(1.025);
    box-shadow: 0 0 5px 5px rgba(255, 0, 0, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px 5px rgba(255, 0, 0, 0);
  }
}
</style>
