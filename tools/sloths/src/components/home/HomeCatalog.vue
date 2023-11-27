<template>
  <div class="home-catalog">
    <div class="home-catalog__wrapper">
      <div class="home-catalog_up"></div>
      <div class="home-catalog_down"></div>
    </div>
    <div class="home-catalog__name">{{ $t('catalog.title') }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeCatalog',
});
</script>

<style scoped>
.home-catalog {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  cursor: pointer;
}

.home-catalog__wrapper {
  position: relative;
  width: 40rem;
  height: 40rem;
}

.home-catalog_up,
.home-catalog_down {
  position: absolute;
  width: 100%;
  height: 24rem;
  transition: 0.3s;
}

.home-catalog_up {
  top: 50%;
  transform: translate(0, -50%);
  z-index: 2;
  background: no-repeat center center / contain url('/img/home/catalog-up.svg');
}

.home-catalog_down {
  bottom: 50%;
  transform: translate(0, 50%);
  z-index: 3;
  background: no-repeat center center / contain url('/img/home/catalog-down.svg');
}

.home-catalog__name {
  text-align: center;
  opacity: 0;
  color: var(--color-text);
  font-size: 2.4rem;
  font-weight: 300;
  transition: 0.3s;
}

.home-catalog:hover .home-catalog_up {
  top: 0;
  transform: translate(0, 0);
}

.home-catalog:hover .home-catalog_down {
  bottom: 0;
  transform: translate(0, 0);
}

.home-catalog:hover .home-catalog__name {
  opacity: 1;
}

@media (max-width: 1400px) {
  .home-catalog {
    grid-area: B;
  }
}

@media (max-width: 768px) {
  .home-catalog_up {
    top: 0;
    transform: translate(0, 0);
  }

  .home-catalog_down {
    bottom: 0;
    transform: translate(0, 0);
  }

  .home-catalog__name {
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .home-catalog__wrapper {
    width: 30rem;
    height: 36rem;
  }
}
</style>
