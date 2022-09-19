<template>
  <div :class="`home-category home-category_${category}`">
    <div class="home-category__img">
      <template v-if="category === 'profile'">
        <img
          class="home-category__photo"
          :src="hasAuth ? getUserAvatar : imageSrc"
          :alt="hasAuth ? 'Profile' : 'Authorization'"
        />
      </template>
    </div>
    <div class="home-category__name">{{ $t(`${category}.title`) }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import useCurrUser from '@/stores/curr-user';

import { DEFAULT_USER_AVATAR } from '@/common/const';

export default defineComponent({
  name: 'HomeCategory',

  data() {
    return {
      imageSrc: DEFAULT_USER_AVATAR,
    };
  },

  props: {
    category: {
      type: String,
      default: () => '',
    },
  },

  computed: {
    ...mapState(useCurrUser, ['hasAuth', 'getUserAvatar']),
  },
});
</script>

<style scoped>
.home-category {
  width: 10rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
}

.home-category__img {
  height: 10rem;
  width: 100%;
  border-radius: 50%;
  border: 0.3rem var(--color-border-inverse) solid;
  background-color: var(--color-background-soft);
  transition: 0.3s;
}

.home-category__photo {
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.home-category_suggest > .home-category__img {
  background: no-repeat center center / contain url('../../assets/icons/home/suggest.svg') var(--color-background-soft);
}

.home-category_memory > .home-category__img {
  background: no-repeat center center / contain url('../../assets/icons/home/memory.svg') var(--color-background-soft);
}

.home-category_guess > .home-category__img {
  background: no-repeat center center / contain url('../../assets/icons/home/guess.svg') var(--color-background-soft);
}

.home-category_create > .home-category__img {
  background: no-repeat center center / contain url('../../assets/icons/home/create.svg') var(--color-background-soft);
}

.home-category_merch > .home-category__img {
  background: no-repeat center center / contain url('../../assets/icons/home/merch.svg') var(--color-background-soft);
}

.home-category__name {
  text-align: center;
  color: var(--color-text);
  font-weight: 300;
  opacity: 0;
  transition: 0.3s;
}

.home-category:hover .home-category_up {
  top: 20%;
  transform: translate(0, 0);
}

.home-category:hover .home-category_down {
  top: none;
  bottom: 20%;
  transform: translate(0, 0);
}

.home-category:hover .home-category__img {
  transform: scale(1.1) rotate(-10deg);
}

.home-category:hover .home-category__name {
  opacity: 1;
}
</style>
