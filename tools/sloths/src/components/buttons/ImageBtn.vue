<template>
  <button :class="className" @click="onClick" :disabled="disabled" :title="text">
    <img class="image" :src="imgPath" :alt="text" />
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapWritableState } from 'pinia';
import themeProp from '@/stores/theme';

export default defineComponent({
  name: 'ImageBtn',

  props: {
    text: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: 'btn btn-img',
    },
    imgPath: {
      type: String,
      default: '',
    },
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapWritableState(themeProp, ['currTheme']),
  },
});
</script>

<style>
.btn-img .image {
  overflow: hidden;
  border: 0.2rem solid var(--color-border-inverse);
}

.btn-img:hover:not([disabled]) {
  transform: scale(1.1) rotate(10deg);
}

.btn-merch {
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  border: 0.2rem solid var(--color-border-inverse);
  align-self: center;
}

.btn-merch > .image {
  height: 100%;
  width: 100%;
  padding: 0.5rem;
  object-fit: contain;
  border: none;
}

.btn-memory {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-inverse-soft);
  transition: 0.5s ease;
}

.btn-memory > .image {
  border: none;
  border-radius: 0.5rem;
}

.btn-memory:disabled {
  cursor: default;
}

.btn-memory:hover:not([disabled]) {
  transform: scale(1.1) rotate(10deg);
}

.btn-download {
  margin: 0 auto;
  padding: 0;
  width: 24rem;
}

.btn-download > .image {
  border: none;
}

.btn-download:hover:not([disabled]) {
  transform: scale(1.1);
}

.btn-download:disabled {
  filter: grayscale(1);
  transform: scale(0.9);
  cursor: default;
}
</style>
