<template>
  <button :class="classNameTheme" @click="onClick" :disabled="disabled" :title="text"></button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { mapWritableState } from 'pinia';
import themeProp from '@/stores/theme';

export default defineComponent({
  name: 'IconBtn',

  props: {
    text: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: 'btn btn-icon',
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

    classNameTheme() {
      return this.className.includes('icon-')
        ? this.className.replace('icon-', `icon-${this.currTheme}-`)
        : this.className;
    },
  },
});
</script>

<style>
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

.icon-light-center {
  background-image: url('@/assets/icons/btn/center-square.svg');
}

.icon-dark-center {
  background-image: url('@/assets/icons/btn/center-square-black.svg');
}

.icon-light-minus {
  background-image: url('@/assets/icons/btn/dash-square.svg');
}

.icon-dark-minus {
  background-image: url('@/assets/icons/btn/dash-square-black.svg');
}
</style>
