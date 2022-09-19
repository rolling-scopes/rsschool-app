<template>
  <button v-if="imgPath === ''" :class="getClassNameTheme" @click="onClick" :disabled="disabled" :title="text">
    {{ text }}
  </button>
  <button
    v-else-if="imgPath === 'icon'"
    :class="getClassNameTheme"
    @click="onClick"
    :disabled="disabled"
    :title="text"
  ></button>
  <button v-else class="btn-img" :class="className" @click="onClick" :disabled="disabled" :title="text">
    <img class="image" :src="imgPath" :alt="text" />
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapWritableState } from 'pinia';
import themeProp from '@/stores/theme';

export default defineComponent({
  name: 'CustomBtn',

  props: {
    text: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: 'btn btn-primary',
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

    getClassNameTheme() {
      return this.className.includes('icon-')
        ? this.className.replace('icon-', `icon-${this.currTheme}-`)
        : this.className;
    },
  },
});
</script>

<style>
.btn {
  display: inline-block;
  padding: 0.4em 0.8em;
  background: none;
  cursor: pointer;
  user-select: none;
  transition: 0.3s;
  border: none;
}

.btn-primary {
  border-radius: 0.3rem;
  color: var(--color-text-inverse);
  background-color: var(--color-background-inverse);
}

.btn-primary:hover:not([disabled]) {
  background-color: var(--color-background-inverse-soft);
}

.btn-primary:disabled,
.btn-pagination:disabled {
  cursor: default;
  color: gray;
  background-color: var(--color-background-inverse-soft);
}

.btn-pagination {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  color: var(--color-text-inverse);
  background-color: var(--color-background-inverse);
}

.btn-pagination:hover:not([disabled]) {
  background-color: var(--color-background-inverse-soft);
}

.btn-img .image {
  overflow: hidden;
  border: 0.2rem solid var(--color-border-inverse);
}

.btn-catalog {
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  border: 0.2rem solid var(--color-border-inverse);
  align-self: center;
}

.btn-catalog .image {
  height: 100%;
  width: 100%;
  padding: 0.5rem;
  object-fit: contain;
  border: none;
}

.btn-img:hover:not([disabled]) {
  transform: scale(1.1) rotate(10deg);
}

.btn-tab {
  border: 1px solid;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  margin-bottom: -1px;
  margin-right: -1px;
  color: var(--color-text);
  background-color: var(--color-background-soft);
}

.btn-tab:hover {
  background-color: var(--color-background);
}

.btn-tab.btn-tab_active,
.btn-tab.btn-tab_active:hover {
  color: var(--color-text-inverse);
  background-color: var(--color-background-inverse);
}

.btn-search {
  position: absolute;
  top: 0.5rem;
  right: -0.5rem;
  background: none;
  color: inherit;
}

.btn-search_admin {
  top: 0;
}

.btn__text {
  color: var(--color-text-inverse);
}

.btn-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: var(--color-background-inverse);
  background-size: 65%;
  background-repeat: no-repeat;
  background-position: center center;
}

.btn-icon:hover {
  background-color: var(--color-background-inverse-soft);
}

.icon-light-del {
  background-image: url('@/assets/icons/btn/trash.svg');
}

.icon-dark-del {
  background-image: url('@/assets/icons/btn/trash-black.svg');
}

.icon-light-edit {
  background-image: url('@/assets/icons/btn/pencil.svg');
}

.icon-dark-edit {
  background-image: url('@/assets/icons/btn/pencil-black.svg');
}

.icon-light-download {
  background-image: url('@/assets/icons/btn/download.svg');
}

.icon-dark-download {
  background-image: url('@/assets/icons/btn/download-black.svg');
}

.icon-light-copy {
  background-image: url('@/assets/icons/btn/clipboard.svg');
}

.icon-dark-copy {
  background-image: url('@/assets/icons/btn/clipboard-black.svg');
}

.icon-light-plus {
  background-image: url('@/assets/icons/btn/plus-square.svg');
}

.icon-dark-plus {
  background-image: url('@/assets/icons/btn/plus-square-black.svg');
}

.icon-light-true {
  background-image: url('@/assets/icons/btn/check-square.svg');
}

.icon-dark-true {
  background-image: url('@/assets/icons/btn/check-square-black.svg');
}

.icon-light-minus {
  background-image: url('@/assets/icons/btn/dash-square.svg');
}

.icon-dark-minus {
  background-image: url('@/assets/icons/btn/dash-square-black.svg');
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

.btn-memory > img {
  border: none;
  border-radius: 0.5rem;
}

.btn-memory:disabled {
  cursor: default;
}

.btn-memory:hover:not([disabled]) {
  transform: scale(1.1) rotate(10deg);
}

.btn-link {
  color: var(--color-text);
  border: 0.2rem solid var(--color-border-inverse);
  border-radius: 0.5rem;
  text-decoration: none;
}

.btn-link:hover:not([disabled]) {
  border-color: var(--color-border-theme);
  background-color: var(--color-background-soft);
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

@media (max-width: 1200px) {
  .btn-tab {
    border-radius: 0.5rem;
    margin: 0;
    text-align: center;
  }
}
</style>
