<template>
  <div class="loader">
    <div class="loader__wrap">
      <div class="sloth-loader sloth-1"></div>
      <div class="sloth-loader sloth-2"></div>
      <div class="sloth-loader sloth-3"></div>
      <div class="sloth-loader sloth-4"></div>
      <div class="sloth-loader sloth-5"></div>
      <div class="sloth-loader sloth-6"></div>
      <div class="sloth-loader sloth-7"></div>
      <div class="sloth-loader sloth-8"></div>
    </div>
    <span class="loader__text">{{ $t('loader.text') }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoaderView',
});
</script>

<style scoped>
.loader {
  position: absolute;
  height: 100vh;
  width: 100vw;
  z-index: 1000;
  background-color: var(--dark-opacity);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.loader__wrap {
  width: 10rem;
  height: 10rem;
  position: relative;
}

.loader__wrap > .sloth-loader {
  position: absolute;
  height: 2rem;
  width: 2.2rem;
  background: no-repeat center center / contain url('../../assets/icons/loader/loader-point.svg');
  opacity: 0;
  animation-name: scaleAnim;
  animation-duration: 1.2s;
  animation-iteration-count: infinite;
}

.sloth-1 {
  left: 0.3rem;
  top: 4rem;
  animation-delay: 0.45s;
}

.sloth-2 {
  left: 1.5rem;
  top: 1.5rem;
  animation-delay: 0.6s;
}

.sloth-3 {
  left: 4rem;
  top: 0.3rem;
  animation-delay: 0.75s;
}

.sloth-4 {
  right: 1.5rem;
  top: 1.5rem;
  animation-delay: 0.9s;
}

.sloth-5 {
  right: 0.3rem;
  top: 4rem;
  animation-delay: 1.05s;
}

.sloth-6 {
  right: 1.5rem;
  bottom: 1.5rem;
  animation-delay: 1.2s;
}

.sloth-7 {
  left: 4rem;
  bottom: 0.3rem;
  animation-delay: 1.35s;
}

.sloth-8 {
  left: 1.5rem;
  bottom: 1.5rem;
  animation-delay: 1.5s;
}

@keyframes scaleAnim {
  0% {
    transform: scale(1.6);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.loader__text {
  color: var(--color-text-inverse);
}
</style>
