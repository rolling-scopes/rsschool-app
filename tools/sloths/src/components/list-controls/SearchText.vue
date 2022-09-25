<template>
  <div class="search">
    <input
      type="text"
      class="search__text"
      :placeholder="placeholder"
      :title="placeholder"
      v-model="searchText"
      @change="search"
    />
    <custom-btn @click="clearSearch" text="X" className="btn btn-search btn-search_admin"></custom-btn>
  </div>
</template>

<script lang="ts">
import useSearchText from '@/stores/search-text';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import { defineComponent } from 'vue';

const { getSearchText, setSearchText } = useSearchText();

const searchText = defineComponent({
  name: 'SearchText',

  components: {
    CustomBtn,
  },

  data() {
    return {
      searchText: getSearchText(),
    };
  },

  props: {
    placeholder: {
      type: String,
      required: true,
    },
  },

  methods: {
    search() {
      setSearchText(this.searchText);
      this.$emit('search');
    },

    clearSearchText() {
      this.searchText = '';
      setSearchText(this.searchText);
    },

    clearSearch() {
      this.searchText = '';
      this.search();
    },
  },
});
export default searchText;
export type SearchTextElement = InstanceType<typeof searchText>;
</script>

<style>
.search {
  position: relative;
  color: var(--color-text);
}

.search__text {
  padding: 0.5rem;
  padding-right: 2rem;
  width: 100%;
  border: 0.2rem solid var(--color-border-inverse-soft);
  background-color: var(--color-background);
  color: inherit;
  border-radius: 1rem;
  transition: 0.5s ease;
}

.search__text,
.search__text:focus {
  outline: none;
}

.search__text:focus {
  border-color: var(--color-border-inverse);
}
</style>
