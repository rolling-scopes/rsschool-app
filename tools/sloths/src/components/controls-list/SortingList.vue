<template>
  <div class="sorting">
    <select name="select" class="sorting__select select-element" v-model="sorting" @change="sortingList">
      <option disabled value="">{{ title }}</option>
      <option v-for="item in options" :key="item.value" :value="item.value">{{ $t(item.text) }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import type { SelectOptions } from '@/common/types';
import useSortingList from '@/stores/sorting-list';
import { defineComponent, type PropType } from 'vue';

const { getSortingList, setSortingList } = useSortingList();

const sortingList = defineComponent({
  name: 'SortingList',

  data() {
    return {
      sorting: getSortingList(),
    };
  },

  props: {
    title: {
      type: String,
      required: true,
    },

    options: {
      type: Object as PropType<SelectOptions[]>,
      required: true,
    },
  },

  methods: {
    sortingList() {
      setSortingList(this.sorting);
      this.$emit('sorting');
    },

    clearSorting() {
      this.sorting = this.options[0].value;
      setSortingList(this.sorting);
    },
  },
});
export default sortingList;
export type SortingListElement = InstanceType<typeof sortingList>;
</script>

<style>
.sorting {
  cursor: pointer;
  color: var(--color-text);
}

.sorting__select {
  width: 100%;
  color: inherit;
  background-color: var(--color-background);
  border: 0.2rem solid var(--color-border-inverse-soft);
  border-radius: 1rem;
  transition: 0.5s ease;
}

.sorting__select,
.sorting__select:focus {
  outline: none;
}

.sorting__select:focus {
  border-color: var(--color-border-inverse);
}
</style>
