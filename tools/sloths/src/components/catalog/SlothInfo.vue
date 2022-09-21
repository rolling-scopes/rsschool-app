<template>
  <div class="sloth-info">
    <modal-window v-show="isSlothInfoVisible" @close="closeModal">
      <template v-slot:header> {{ getHeader }} </template>

      <template v-slot:body>
        <div>
          <div v-if="isView" class="sloth-info__props">
            <div class="sloth-info__sloth">
              <img class="sloth-info__img" :src="getImageUrl" :alt="slothInfo.name" />
            </div>
            <div class="sloth-info__property property-center">
              <p class="sloth-info__text">{{ slothInfo.description }}</p>
            </div>
            <div class="sloth-info__property property-center">
              <div class="tags">
                <span class="tag" v-for="tag in slothInfo.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { storeToRefs } from 'pinia';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import useSlothInfo from '@/stores/sloth-info';
import { ModalEvents } from '@/common/enums/modal-events';
import { CATALOG_SLOTH_PREVIEW, CDN_URL } from '@/common/const';

const { slothInfo, tagsStr } = storeToRefs(useSlothInfo());

export default defineComponent({
  name: 'SlothInfo',

  components: {
    ModalWindow,
  },

  data() {
    return {
      slothInfo,
      tags: tagsStr,
      newFile: {} as File,
      preview: CATALOG_SLOTH_PREVIEW,
      isModalVisible: false,
    };
  },

  props: {
    isSlothInfoVisible: {
      type: Boolean,
      default: false,
    },
    headerText: {
      type: String,
      required: true,
    },
    modalEvents: {
      type: String as PropType<ModalEvents>,
      default: ModalEvents.view,
    },
  },

  computed: {
    isView(): boolean {
      return this.modalEvents === ModalEvents.view;
    },

    getHeader(): string {
      return this.slothInfo.name;
    },

    getImageUrl(): string {
      return this.slothInfo.id ? `${CDN_URL}/${this.slothInfo.id}/image.svg` : CATALOG_SLOTH_PREVIEW;
    },
  },

  methods: {
    closeModal() {
      this.$emit('closeSlothInfo');

      const { uploadBtn } = this.$refs;
      if (uploadBtn instanceof HTMLInputElement) uploadBtn.value = '';
      this.preview = CATALOG_SLOTH_PREVIEW;
      this.newFile = {} as File;
    },
  },
});
</script>

<style scoped>
.sloth-info__props {
  max-width: 50rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
}

.sloth-info__sloth,
.sloth-info__property {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
}

.property-center {
  justify-content: center;
}

.sloth-info__sloth {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sloth-info__file {
  opacity: 0;
  height: 1px;
}

.sloth-info__img {
  height: 20rem;
}

.sloth-info__text {
  text-align: center;
  white-space: pre-wrap;
}

.sloth-info__text_rate {
  display: flex;
  align-items: center;
}

.sloth-info__input {
  width: 30rem !important;
}

.sloth-info__text__main {
  font-size: 2rem;
}

.sloth-info__text__sloth {
  height: 2rem;
}
</style>
