<template>
  <div class="page-404">
    <div class="page-404__image"></div>
    <div class="page-404__wrap">
      <h2 class="page-404__title">{{ $t('404.title') }}</h2>
      <p class="page-404__descr">{{ $t('404.text') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: '404View',
});
</script>

<style scoped>
.page-404 {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.page-404__image {
  height: 50rem;
  width: 50rem;
  background: no-repeat center center / contain url('../assets/icons/404/404.svg');
}

.page-404__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
  width: 50rem;
}

.page-404__title {
  color: var(--color-heading);
  font-weight: bold;
  font-size: 3.6rem;
}

.page-404__descr {
  font-size: 2.4rem;
  line-height: 3.6rem;
  text-align: center;
  color: var(--color-text);
}

@media (max-width: 1200px) {
  .page-404__image {
    height: 20rem;
    width: 20rem;
  }
}

@media (max-width: 1200px) {
  .page-404 {
    flex-direction: column;
    gap: 3rem;
  }

  .page-404__wrap {
    width: 90%;
    gap: 3rem;
  }
}
</style>
