<template>
  <div class="game-info">
    <div class="game-info__title">{{ $t('profile.btn.sloth') }}</div>
    <div class="result">
      <div class="result__sloth">
        <img class="result__img" :src="slothUrl" :alt="caption" />
      </div>
      <div class="result__wrap">
        <div class="result__name">{{ caption }}</div>
        <div class="result__descr">{{ descr }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import useLoader from '@/stores/loader';

import { errorHandler } from '@/services/error-handling/error-handler';
import { UsersService } from '@/services/users-service';

import { BASE } from '@/common/const';

export default defineComponent({
  name: 'SlothToday',

  data() {
    return {
      slothUrl: '',
      caption: '',
      descr: '',
    };
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),
  },

  async mounted() {
    await this.todaySloth();
  },

  methods: {
    async todaySloth() {
      this.isLoad = true;
      try {
        const res = await UsersService.getTodaySloth();

        if (!res.ok) throw Error();

        this.slothUrl = `${BASE}/${res.data.image_url}`;
        this.caption = res.data.caption;
        this.descr = res.data.description;
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },
  },
});
</script>

<style scoped>
.game-info {
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: var(--gap-2);
}

.game-info__title {
  text-align: center;
  font-size: 2.4rem;
}

.result {
  display: flex;
}

.result__sloth {
  width: 25rem;
  height: 25rem;
}

.result__img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.result__wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap-2);
}

.result__name {
  font-size: 2.2rem;
}

.result__descr {
  font-size: 1.8rem;
  white-space: pre-wrap;
}
</style>
