<template>
  <div :class="`home-category home-category_${category}`">
    <div class="home-category__img"></div>
    <div class="home-category__name">{{ $t(`${category}.title`) }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeCategory',

  props: {
    category: {
      type: String,
      default: () => '',
    },
  },
});
</script>

<style scoped>
.home-category {
  width: 15rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  cursor: pointer;
}

.home-category__img {
  height: 15rem;
  width: 100%;
  border-radius: 50%;
  border: 0.3rem var(--color-border-inverse) solid;
  background-color: var(--color-background-soft);
  transition: 0.3s;
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
  font-size: 2rem;
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

@media (max-width: 768px) {
  .home-category__name {
    opacity: 1;
  }
}
</style>
