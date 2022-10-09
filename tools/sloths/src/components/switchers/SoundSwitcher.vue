<template>
  <div class="sound-switcher">
    <input
      class="sound-switcher__input"
      type="radio"
      v-for="(sound, i) in sounds"
      :key="`sound-${i}`"
      :value="sound"
      v-model="currSound"
      :name="`sound-${sound}`"
      :id="`sound-${sound}`"
    />

    <label
      class="sound-switcher__label"
      :for="`sound-${soundStatus}`"
      :class="`sound-switcher__label_${currTheme}-${soundStatus}`"
      :title="$t('header.switchers.sound')"
      v-shortkey="['ctrl', '1']"
      @shortkey="setSoundValue(`${soundStatus}`)"
    ></label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import useAudioOn from '../../stores/audio-on';
import themeProp from '../../stores/theme';

export default defineComponent({
  name: 'ThemeSwitcher',

  data(): { currSound: string; sounds: string[] } {
    return {
      currSound: '',
      sounds: ['on', 'off'],
    };
  },

  computed: {
    ...mapWritableState(useAudioOn, ['isAudioOn']),
    ...mapWritableState(themeProp, ['currTheme']),
    soundStatus(): string {
      return this.sounds.filter((sound) => sound !== this.currSound)[0];
    },
  },

  mounted() {
    this.currSound = this.getSoundValue() || 'on';
  },

  watch: {
    currSound(newValue) {
      this.setSoundValue(newValue);
    },
  },

  methods: {
    getSoundValue(): string | null {
      return localStorage.getItem('rs-sloths-sound');
    },

    setSoundValue(sound: string): void {
      localStorage.setItem('rs-sloths-sound', sound);
      this.currSound = sound;
      this.isAudioOn = sound === 'on';
    },
  },
});
</script>

<style scoped>
.sound-switcher__input {
  display: none;
}

.sound-switcher__label {
  display: block;
  width: 3rem;
  height: 3rem;
  transition: 0.5s ease;
  cursor: pointer;
}

.sound-switcher__label_light-on {
  background: center center / cover url('@/assets/icons/sounds/sound-light-on.svg') no-repeat;
}

.sound-switcher__label_light-off {
  background: center center / cover url('@/assets/icons/sounds/sound-light-off.svg') no-repeat;
}

.sound-switcher__label_dark-on {
  background: center center / cover url('@/assets/icons/sounds/sound-dark-on.svg') no-repeat;
}

.sound-switcher__label_dark-off {
  background: center center / cover url('@/assets/icons/sounds/sound-dark-off.svg') no-repeat;
}

.sound-switcher__label:hover {
  transform: scale(1.1) rotate(-5deg);
}
</style>
