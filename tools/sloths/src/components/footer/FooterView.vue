<template>
  <footer class="footer" :class="`footer-${currTheme}`">
    <a class="rss" href="https://rs.school/js/" target="_blank"></a>
    <div class="team">
      <a class="team__item link" href="https://github.com/WiiJoy" target="_blank">WiiJoy</a>
      <a class="team__item link" href="https://github.com/Ogimly" target="_blank">Ogimly</a>
      <a class="team__item link" href="https://github.com/ThorsAngerVaNeT" target="_blank">VaNeT</a>
      <p class="team__item">© 2022</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import themeProp from '../../stores/theme';

export default defineComponent({
  name: 'FooterView',

  computed: {
    ...mapWritableState(themeProp, ['currTheme']),
  },
});
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem;
  z-index: 3;
  transition: .5s ease;
}

.footer-light {
  background: repeat-x left bottom / contain url('../../assets/backgrounds/bg-footer-light.svg');
}

.footer-dark {
  background: repeat-x left bottom / contain url('../../assets/backgrounds/bg-footer-dark.svg');
}

.rss {
  height: 2rem;
  width: 5rem;
  background: center center / contain url('../../assets/icons/rs-school.png') no-repeat;
}

.team {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.team__item {
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.2rem;
  transition: 0.3s;
}

.link:hover {
  color: var(--color-heading);
}
</style>
