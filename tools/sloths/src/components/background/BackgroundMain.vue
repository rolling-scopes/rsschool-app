<template>
  <div class="background-main" :class="`background-main-${currTheme}`"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import themeProp from '../../stores/theme';

export default defineComponent({
  name: 'BackgroundMain',

  computed: {
    ...mapWritableState(themeProp, ['currTheme']),
  },
});
</script>

<style scoped>
.background-main {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 1;
  transition: 0.5s ease;
}

.background-main-light {
  background: no-repeat center center / cover url('../../assets/backgrounds/bg-stars-light.svg');
}

.background-main-dark {
  background: no-repeat center center / cover url('../../assets/backgrounds/bg-stars-dark.svg');
}
</style>
