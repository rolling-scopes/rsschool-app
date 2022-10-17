<template>
  <button :class="className" @click="onClick" :disabled="disabled" :title="text">
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapWritableState } from 'pinia';
import useThemeProp from '@/stores/theme';

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
    ...mapWritableState(useThemeProp, ['currTheme']),
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
  top: 0;
  right: -0.5rem;
  background: none;
  color: inherit;
}

.btn__text {
  color: var(--color-text-inverse);
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

@media (max-width: 1200px) {
  .btn-tab {
    border-radius: 0.5rem;
    margin: 0;
    text-align: center;
  }
}
</style>
