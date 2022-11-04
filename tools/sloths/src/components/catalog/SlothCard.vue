<template>
  <div :class="`${pageName}-sloth-info`">
    <div v-if="catalogPage && !isDownload" class="catalog-sloth-info__inner">
      <div class="catalog-sloth-info__sloth">
        <img class="catalog-sloth-info__img" :src="imageUrl" :alt="slothInfo.name" />
        <div class="sloth-info__tags tags">
          <span class="sloth-info__tag" v-for="tag in slothInfo.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
      <custom-btn :className="'icon ' + classNameCheckIcon" @click="$emit('checkSloth', slothInfo)"></custom-btn>
      <div>
        <div class="catalog-sloth-info__props">
          <p class="sloth-info__property sloth-info__property_text">{{ slothInfo.name }}</p>
        </div>
      </div>
      <custom-btn
        :text="$t('btn.show')"
        className="btn btn-primary"
        @click="$emit('showSloth', slothInfo)"
      ></custom-btn>
    </div>

    <div v-else class="download-sloth-info__inner">
      <custom-btn
        :className="'download-icon ' + classNameCheckIcon"
        @click="$emit('checkSloth', slothInfo)"
      ></custom-btn>
      <div class="download-sloth-info__sloth">
        <img class="download-sloth-info__img" :src="imageUrl" :alt="slothInfo.name" />
      </div>
      <p class="sloth-info__property">{{ slothInfo.name }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Sloth } from '@/common/types';
import CustomBtn from '@/components/buttons/CustomBtn.vue';

export default defineComponent({
  name: 'SlothCard',

  components: {
    CustomBtn,
  },

  data() {
    return {
      isApproveShow: false,
    };
  },

  props: {
    slothInfo: {
      type: Object as PropType<Sloth>,
      required: true,
    },
    isDownload: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    imageUrl(): string {
      return this.slothInfo.image;
    },

    pageName(): string {
      if (this.isDownload) return 'download';
      return 'catalog';
    },

    catalogPage(): boolean {
      return this.$route.name === 'catalog';
    },

    classNameCheckIcon(): string {
      return this.slothInfo.checked ? 'icon_check-on' : 'icon_check-off';
    },
  },

  methods: {
    closeModal() {
      this.isApproveShow = false;
    },
  },
});
</script>

<style scoped>
.catalog-sloth-info {
  overflow: hidden;
  background-color: var(--color-background-soft);
  border: 1px solid gray;
}

.catalog-sloth-info {
  position: relative;
  padding: 1rem;
  width: 30rem;
  border-radius: 1rem;
}

.catalog-sloth-info:hover {
  box-shadow: 0px 0px 0.5rem gray;
}

.catalog-sloth-info__inner,
.download-sloth-info__inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.catalog-sloth-info__inner {
  flex-direction: column;
  justify-content: center;
}

.catalog-sloth-info__sloth {
  position: relative;
  overflow: hidden;
}

.catalog-sloth-info__img {
  width: 100%;
  height: 25rem;
  object-fit: contain;
}

.catalog-sloth-info__props {
  display: flex;
  flex-direction: column;
}

.catalog-sloth-info__props {
  text-align: center;
  align-items: center;
  gap: var(--gap);
}

.sloth-info__property {
  font-size: 2rem;
}

.sloth-info__property_text {
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sloth-info__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
}

.btn-horizontal {
  flex-direction: row;
}

.sloth-info__tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(-500px);
  transition: transform 0.3s;
  justify-content: center;
  z-index: 10;
}

.catalog-sloth-info__sloth:hover .sloth-info__tags {
  transform: translateY(0);
}

.sloth-info__tag {
  padding: 0.5rem 0.7rem;
  cursor: default;
  color: inherit;
  background-color: var(--color-background);
  border-radius: 1rem;
  border: 1px solid gray;
}

.icon,
.download-icon {
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  border: none;
  background-color: transparent;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}

.icon {
  position: absolute;
  bottom: 0rem;
  right: 0rem;
}

.icon_check-on {
  background-image: url('@/assets/icons/btn/check-circle-fill.svg');
}

.icon_check-off {
  background-image: url('@/assets/icons/btn/check-circle.svg');
}

.download-sloth-info {
  position: relative;
  height: 6rem;
}

.download-sloth-info__img {
  height: 6rem;
}

.sloth-info__select {
  padding: 0.5rem;
  border: 0.2rem solid var(--color-border-inverse-soft);
  background-color: var(--color-background);
  color: inherit;
  width: 5rem;
  border-radius: 1rem;
  transition: 0.5s ease;
}

.sloth-info__user-other {
  align-self: end;
}

.sloth-info__text__sloth {
  height: 2rem;
}
</style>
