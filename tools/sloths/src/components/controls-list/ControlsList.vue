<template>
  <div class="controls">
    <search-text ref="search" @search="$emit('search')" :placeholder="placeholder"></search-text>
    <tag-cloud ref="tags" @tags="$emit('tags')" :tags="tags"></tag-cloud>
    <sorting-list ref="sorting" @sorting="$emit('sorting')" :title="title" :options="options"></sorting-list>
    <custom-btn @click="clearAll" :text="$t('btn.reset')" className="btn btn-primary"></custom-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { SelectOptions } from '@/common/types';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import SearchText, { type SearchTextElement } from '@/components/controls-list/SearchText.vue';
import TagCloud, { type TagCloudElement } from '@/components/controls-list/TagCloud.vue';
import SortingList, { type SortingListElement } from '@/components/controls-list/SortingList.vue';

export default defineComponent({
  name: 'ControlsList',

  components: {
    CustomBtn,
    SearchText,
    TagCloud,
    SortingList,
  },

  props: {
    placeholder: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    options: {
      type: Object as PropType<SelectOptions[]>,
      required: true,
    },

    tags: {
      type: Object as PropType<string[]>,
      required: true,
    },
  },

  methods: {
    clearAll() {
      const search = this.$refs.search as SearchTextElement;
      if (search) search.clearSearchText();
      const tags = this.$refs.tags as TagCloudElement;
      if (tags) tags.clearSelected();
      const sorting = this.$refs.sorting as SortingListElement;
      if (sorting) sorting.clearSorting();

      this.$emit('clearAll');
    },
  },
});
</script>

<style scoped>
.controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
