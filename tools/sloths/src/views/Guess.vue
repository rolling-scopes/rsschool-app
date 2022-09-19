<template>
  <div class="guess">
    <custom-btn
      :text="$t('guess.results')"
      className="btn btn-primary"
      @click="isTableResultsVisible = true"
    ></custom-btn>
    <h2 class="guess__description">{{ $t('guess.description') }}</h2>
    <h3 class="guess__description">{{ $t('guess.rules') }}</h3>
    <custom-btn
      v-show="step < 0"
      :text="$t('guess.start')"
      className="btn btn-primary"
      :onClick="startGame"
    ></custom-btn>

    <div class="guess__imgs" :class="step >= 0 ? 'guess__imgs_active' : ''">
      <div v-for="(item, index) in gameCards" :key="index" class="guess__img-wrapper">
        <transition name="slider" mode="out-in">
          <img v-show="index === step" :src="item.question.img" :alt="$t('guess.guess')" class="guess__img" />
        </transition>
      </div>
    </div>
    <div v-for="(item, index) in gameCards" :key="index">
      <div v-show="index === step" class="guess__answers">
        <span
          v-for="(answer, i) in item.answers"
          :key="i"
          :class="`guess__answer ${getClassStepSelect(i)}`"
          @click="setAnswer(index, i)"
          v-shortkey.once="[`${i + 1}`]"
          @shortkey="setAnswer(step, i)"
        >
          {{ i + 1 }} - {{ answer.caption }}
        </span>
      </div>
    </div>

    <custom-btn
      v-show="step >= 0"
      :text="$t('guess.next')"
      className="btn btn-primary"
      :disabled="stepSelection < 0"
      :onClick="nextStep"
      v-shortkey="['enter']"
      @shortkey="nextStep"
    ></custom-btn>
    <div v-show="step >= 0" class="guess__results">
      <div v-for="(res, index) in result" :key="index" :class="`guess__result ${getClassStepResult(index)}`"></div>
    </div>

    <modal-window v-show="isModalVisible" @close="closeModal">
      <template v-slot:header> {{ $t('guess.congrats') }} </template>

      <template v-slot:body>
        <div class="guess-modal__wrap">
          <img class="guess-modal__img" :src="cardWinnerAll" alt="winner" />
          <p class="guess-modal__points">{{ Math.round((getGuesses * 100) / gameCards.length) }} %</p>
        </div>
        <p>{{ allGuesses ? `${$t('guess.win')} ` : '' }}{{ $t('guess.result') }}</p>
        <p>{{ getGuesses }} / {{ gameCards.length }} {{ $t('guess.guesses') }}</p>
        <p>{{ getTime / 1000 }} {{ $t('memory.time') }}</p>
      </template>
    </modal-window>
    <modal-window v-show="isTableResultsVisible" @close="closeTableResults">
      <template v-slot:header> {{ $t('guess.results') }} </template>
      <template v-slot:body>
        <guess-info></guess-info>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import GuessInfo from '@/components/profile/GuessInfo.vue';
import { GUESS_GAME_WINNER, GUESS_GAME_WINNER_ALL, GUESS_GAME_ID, GUESS_SLOTHS } from '@/common/const';
import { playAudio, audioWin, audioSadTrombone, audioOvation } from '@/utils/audio';
import type { GameResult } from '@/common/types';
import { GameResultService } from '@/services/game-result-service';

type Card = {
  caption: string;
  img: string;
};

type GameCard = {
  question: Card;
  answers: Card[];
};

export default defineComponent({
  name: 'GuessView',

  components: {
    CustomBtn,
    ModalWindow,
    GuessInfo,
  },

  data() {
    return {
      questions: [] as Card[],
      answers: [] as Card[],
      gameCards: [] as GameCard[],
      result: [] as boolean[],
      startTime: 0,
      endTime: 0,
      step: -1,
      stepSelection: -1,
      stepAnswer: false,
      cardWinner: GUESS_GAME_WINNER,
      cardWinnerAll: GUESS_GAME_WINNER_ALL,
      isAnimated: false,
      isModalVisible: false,
      isTableResultsVisible: false,
    };
  },

  computed: {
    getGuesses(): number {
      return this.result.filter((el) => el).length;
    },

    allGuesses(): boolean {
      return this.getGuesses === this.gameCards.length;
    },

    getTime(): number {
      return this.endTime - this.startTime;
    },
  },

  mounted() {
    this.initCards();
    this.startGame();
  },

  methods: {
    initCards() {
      this.questions = GUESS_SLOTHS;
      this.answers = GUESS_SLOTHS;
    },

    startGame() {
      this.getGameCards();

      this.endTime = 0;
      this.startTime = Date.now();
      this.step = 0;
      this.stepSelection = -1;
      this.stepAnswer = false;
    },

    getGameCards() {
      const gameCards = [] as GameCard[];
      this.result = [];

      this.questions.forEach((question) => {
        const newGameCard = {} as GameCard;
        newGameCard.question = question;

        const trueCard = this.answers.filter((el) => el.caption === question.caption);
        const answers = this.answers
          .filter((el) => el.caption !== question.caption)
          .sort(() => Math.random() - 0.5)
          .filter((el, i) => i < 3);
        answers.push(trueCard[0]);

        newGameCard.answers = answers.sort(() => Math.random() - 0.5);

        gameCards.push(newGameCard);
        this.result.push(false);
      });

      this.gameCards = gameCards.sort(() => Math.random() - 0.5);
    },

    setAnswer(question: number, answer: number) {
      this.stepSelection = answer;
      this.stepAnswer = this.gameCards[question].question.caption === this.gameCards[question].answers[answer].caption;
    },

    nextStep() {
      if (this.stepSelection >= 0) {
        this.result[this.step] = this.stepAnswer;

        if (this.stepAnswer) {
          playAudio(audioWin);
        } else {
          playAudio(audioSadTrombone);
        }

        this.step += 1;
        this.stepAnswer = false;
        this.stepSelection = -1;

        if (this.step === this.gameCards.length) {
          // end
          this.endTime = Date.now();
          playAudio(audioOvation);
          this.isModalVisible = true;
          this.saveResult();

          this.step = -1;
          this.stepSelection = -1;
        }
      }
    },

    getClassStepResult(i: number) {
      if (i >= this.step) return '';
      return this.result[i] ? 'is-guess' : 'is-not-guess';
    },

    getClassStepSelect(i: number) {
      return i === this.stepSelection ? 'active' : '';
    },

    closeModal() {
      this.isModalVisible = false;
    },

    async saveResult() {
      const service = new GameResultService(GUESS_GAME_ID);
      const gameResult: GameResult = {
        gameId: GUESS_GAME_ID,
        count: this.getGuesses,
        time: this.getTime,
      };
      await service.create(gameResult);
    },

    closeTableResults() {
      this.isTableResultsVisible = false;
    },
  },
});
</script>

<style scoped>
.guess {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.guess__description {
  text-align: center;
  color: var(--color-text);
}

.guess__imgs {
  position: relative;
  width: 40rem;
  height: 40rem;
}

.guess__imgs_active {
  background: no-repeat center center / contain url('../img/guess/bg.svg');
}

.guess__img-wrapper {
  position: absolute;
  width: 30rem;
  height: 30rem;
  top: 5rem;
  left: 5rem;
  overflow: hidden;
}

.guess__img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.guess__answers {
  padding: 1rem 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--gap) / 2);

  color: var(--color-text);
}

.guess__answer {
  padding: 0.5rem 0.7rem;
  cursor: pointer;

  color: var(--color-text);
  background-color: var(--color-background-soft);
  border: 0.2rem solid var(--color-border-theme);
  border-radius: 0.5rem;
  text-decoration: none;
}

.guess__answer:hover {
  border-color: var(--color-border-inverse);
}

.active {
  color: var(--color-text-inverse);
  background-color: var(--color-background-inverse);
  border-color: var(--color-border-inverse);
}

.guess__results {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.guess__result {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: gray;
}

.is-guess {
  background-color: var(--green-active);
}

.is-not-guess {
  background-color: var(--red-active);
}

.guess-modal__wrap {
  position: relative;
  width: 35rem;
  height: 35rem;
}

.guess-modal__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.guess-modal__points {
  position: absolute;
  top: 110px;
  left: 7px;
  text-align: center;
  width: 10rem;
  color: black;
  font-weight: 700;
  font-size: 28px;
}

.slider-enter-active {
  animation: slider-out 1s;
}
.slider-leave-active {
  animation: slider-in 1s;
}

@keyframes slider-in {
  0% {
    opacity: 1;
    transform: translateX(-50%);
  }
  100% {
    opacity: 0;
    transform: translateX(-150%);
  }
}

@keyframes slider-out {
  0% {
    opacity: 0;
    transform: translateX(50%);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%);
  }
}
</style>
