<template>
  <div class="suggest-new">
    <h3 class="suggest-new__title">{{ $t('suggest.new') }}</h3>
    <form @submit.prevent="handleSubmit" class="suggest-new__form form" ref="suggestionForm">
      <div class="form__block form__block_1">
        <input class="form__file" type="file" accept="image/*" name="file" id="file" @change="handleUploadChange" />
        <label for="file" class="form__drop" @drop="handleDrop" @dragover="handleDrag">
          <img
            class="form__img"
            ref="img"
            :src="`/img/suggest/upload-${$i18n.locale}-${currTheme}.svg`"
            alt="upload-image"
          />
        </label>
      </div>
      <div class="form__block form__block_2">
        <label for="description" class="form__label">{{ $t('suggest.description') }}</label>
        <textarea
          class="form__input form__textarea"
          v-model="suggest.description"
          :placeholder="$t('suggest.placeholder')"
          id="description"
          autocomplete="off"
          required
        />
      </div>
      <div class="form__block form__block_3">
        <custom-btn
          :text="$t('suggest.btn.submit')"
          className="btn btn-primary"
          type="submit"
          class="form__submit"
        ></custom-btn>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import type { Suggestion } from '@/common/types';

import themeProp from '@/stores/theme';
import useLoader from '@/stores/loader';

import CustomBtn from '../buttons/CustomBtn.vue';

export default defineComponent({
  name: 'SuggestionNew',

  components: {
    CustomBtn,
  },

  data() {
    return {
      suggest: {} as Suggestion,
      image: {} as File,
    };
  },

  computed: {
    ...mapWritableState(themeProp, ['currTheme']),
    ...mapWritableState(useLoader, ['isLoad']),
  },

  methods: {
    handleSubmit() {
      if (this.$refs.suggestionForm instanceof HTMLFormElement) {
        if (this.$refs.suggestionForm.checkValidity()) {
          this.$emit('createSuggest', this.suggest, this.image);
          this.suggest = {} as Suggestion;
          this.image = {} as File;

          if (this.$refs.img instanceof HTMLImageElement) {
            const imgEl = this.$refs.img;
            imgEl.src = `/img/suggest/upload-${this.$i18n.locale}-${this.currTheme}.svg`;
          }
        } else {
          this.$refs.suggestionForm.reportValidity();
        }
      }
    },

    handleDrop(ev: DragEvent) {
      ev.preventDefault();
      ev.stopPropagation();

      if (ev.dataTransfer instanceof DataTransfer) {
        const { files } = ev.dataTransfer;
        this.renderFile(files[0]);
      }
    },

    handleDrag(ev: DragEvent) {
      ev.preventDefault();
      ev.stopPropagation();
    },

    handleUploadChange(ev: Event) {
      if (ev.target instanceof HTMLInputElement && ev?.target?.files) {
        const file: File = ev.target.files[0];
        this.renderFile(file);
      }
    },

    renderFile(file: File) {
      this.image = file;
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (e) => {
        if (this.$refs.img instanceof HTMLImageElement && e.target instanceof FileReader) {
          const imgEl = this.$refs.img;
          imgEl.src = `${e.target.result}`;
        }
      };
    },
  },
});
</script>

<style scoped>
.suggest-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
}

.suggest-new__title {
  font-size: 3.6rem;
  color: var(--color-text);
  transition: 0.5s ease;
}

.form {
  display: grid;
  grid-template-columns: 25rem 50rem;
  grid-template-rows: repeat(2, auto);
  grid-template-areas:
    'A B'
    'C C';
  justify-content: center;
  gap: 3rem;
}

.form__block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.form__block_1 {
  grid-area: A;
}

.form__block_2 {
  grid-area: B;
}

.form__block_3 {
  grid-area: C;
}

.form__label {
  font-size: 2.2rem;
  transition: 0.5s ease;
  color: var(--color-text);
}

.form__file {
  display: none;
}

.form__drop {
  display: block;
  width: 25rem;
  height: 25rem;
  border-radius: 1rem;
}

.form__img {
  height: 100%;
  width: 100%;
  object-fit: contain;
  border-radius: 1rem;
  transition: 0.5s ease;
}

.form__input {
  padding: 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.form__textarea {
  height: 100%;
  width: 100%;
  resize: none;
  transition: 0.5s ease;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
</style>
