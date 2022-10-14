<template>
  <div :class="currClassGroup"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import useThemeProp from '../../stores/theme';

export default defineComponent({
  name: 'BackgroundView',

  props: {
    bgStyle: {
      type: String,
      default: () => 'background',
    },
  },

  computed: {
    ...mapWritableState(useThemeProp, ['currTheme']),

    currRoute() {
      return String(this.$route.name);
    },

    currClassGroup() {
      return this.bgStyle === 'background' ? `${this.bgStyle} ${this.bgStyle}-${this.currRoute}-${this.currTheme}` : `${this.bgStyle} ${this.bgStyle}-${this.currTheme}`;
    }
  },
});
</script>

<style scoped>
.background,
.background-main {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 1;
  transition: 0.5s ease;
}

.background {
  height: calc(100vh - 5rem);
  margin: 2rem 0;
  z-index: 2;
  left: 0;
  bottom: 0;
}

.background-main-light {
  background: no-repeat center center / cover url('../../assets/backgrounds/bg-stars-light.svg');
}

.background-main-dark {
  background: no-repeat center center / cover url('../../assets/backgrounds/bg-stars-dark.svg');
}

.background-home-light {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-home-light.svg');
}

.background-home-dark {
  background: no-repeat left 5rem center / contain url('../../assets/backgrounds/bg-home-dark.svg');
}

.background-about-light {
  background: no-repeat center center / contain url('../../assets/backgrounds/bg-about-light.svg');
}

.background-about-dark {
  background: no-repeat center center / contain url('../../assets/backgrounds/bg-about-dark.svg');
}

.background-memory-light {
  background: no-repeat center center / contain url('../../assets/backgrounds/bg-memory-light.svg');
}

.background-memory-dark {
  background: no-repeat center center / contain url('../../assets/backgrounds/bg-memory-dark.svg');
}

.background-404-light {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-404-light.svg');
}

.background-404-dark {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-404-dark.svg');
}

.background-catalog-light {
  background: no-repeat left -15rem bottom / contain url('../../assets/backgrounds/bg-catalog-light.svg');
}

.background-catalog-dark {
  background: no-repeat left -15rem bottom / contain url('../../assets/backgrounds/bg-catalog-dark.svg');
}

.background-create-light {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-create-light.svg');
}

.background-create-dark {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-create-dark.svg');
}

.background-guess-light {
  background: no-repeat left -10rem bottom / contain url('../../assets/backgrounds/bg-guess-light.svg');
}

.background-guess-dark {
  background: no-repeat left -10rem bottom / contain url('../../assets/backgrounds/bg-guess-dark.svg');
}

.background-merch-light {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-merch-light.svg');
}

.background-merch-dark {
  background: no-repeat left 5rem bottom / contain url('../../assets/backgrounds/bg-merch-dark.svg');
}
</style>
