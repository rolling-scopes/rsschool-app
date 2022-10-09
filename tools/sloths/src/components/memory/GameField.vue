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
            <use :xlink:href="`${memorySprite}#card-cover`"></use>
          </svg>
          <svg v-else alt="card" class="game-field__img" :class="{ success: item.success }">
            <use :xlink:href="getImage(index)"></use>
          </svg>
        </transition>
      </div>
    </transition-group>
    <modal-window v-show="modalVisible" @close="closeModal">
      <template v-slot:header> {{ $t('memory.congrats') }} </template>

      <template v-slot:body>
        <img :src="cardWinner" alt="winner" />
        <p>{{ $t('memory.win') }}</p>
        <p>{{ steps }} {{ $t('memory.steps', steps) }}</p>
        <p>{{ gameTime / 1000 }} {{ $t('memory.time') }}</p>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { mapWritableState } from 'pinia';
import { MEMORY_GAME_SRPITE, MEMORY_GAME_TIMEOUT, MEMORY_GAME_WINNER, MEMORY_LEVELS } from '@/common/const';
import type { MemoryLevel, GameResult } from '@/common/types';
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
      memorySprite: MEMORY_GAME_SRPITE,
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

    gameTime(): number {
      return this.endTime - this.startTime;
    },

    modalVisible(): boolean {
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
        `${MEMORY_GAME_SRPITE}#memory01`,
        `${MEMORY_GAME_SRPITE}#memory02`,
        `${MEMORY_GAME_SRPITE}#memory03`,
        `${MEMORY_GAME_SRPITE}#memory04`,
        `${MEMORY_GAME_SRPITE}#memory05`,
        `${MEMORY_GAME_SRPITE}#memory06`,
        `${MEMORY_GAME_SRPITE}#memory07`,
        `${MEMORY_GAME_SRPITE}#memory08`,
        `${MEMORY_GAME_SRPITE}#memory09`,
        `${MEMORY_GAME_SRPITE}#memory10`,
        `${MEMORY_GAME_SRPITE}#memory11`,
        `${MEMORY_GAME_SRPITE}#memory12`,
      ];

      this.getCards();
    },

    getCards() {
      this.changeScrollHidden('hidden');
      this.cards = [];
      let index = 0;

      const images = this.images.sort(() => Math.random() - 0.5).filter((el, i) => i < this.level.n);

      images.forEach((el, i) => {
        this.push2Cards(el, i, index);
        index += 2;
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
        this.shuffleCards();
      } else {
        setTimeout(() => this.shuffleCards(), MEMORY_GAME_TIMEOUT);
      }
      // shuffle 2 times
      setTimeout(() => this.shuffleCards(), MEMORY_GAME_TIMEOUT / 2);
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
        if (!this.isWin()) this.cardsMatched(i, this.changeActiveCard());
      } else {
        this.cardsNotMatched(i, this.changeActiveCard());
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

    shuffleCards() {
      playAudio(audioSlide);
      this.cards.sort(() => Math.random() - 0.5);
    },

    push2Cards(img: string, id: number, index: number) {
      this.cards.push({ img, id, index, open: false, success: false });
      this.cards.push({ img, id, index: index + 1, open: false, success: false });
    },

    changeActiveCard(): number {
      const { activeCard } = this;
      this.activeCard = Infinity;
      return activeCard;
    },

    openCard(i: number) {
      this.cards[i].open = true;
    },

    closeCard(i: number) {
      this.cards[i].open = false;
      this.cards[i].success = false;
    },

    saveResult() {
      let currResults: GameResult[] = [];
      const savedRecords = localStorage.getItem(`rs-sloths-memory-${this.level.level}`);

      if (savedRecords) {
        currResults = JSON.parse(savedRecords);
      }

      const gameResult: GameResult = {
        count: this.steps,
        time: this.gameTime,
        createdAt: new Date().getTime(),
      };

      currResults.unshift(gameResult);

      if (currResults.length > 10) {
        currResults.pop();
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
  padding: 0.2rem;
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
