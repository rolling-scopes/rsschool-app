<template>
  <div class="tags tags-center" :class="isAdmin ? 'tags_admin' : ''">
    <span class="tag" :class="{ active: isHas(item) }" v-for="item in tags" :key="item" @click="select(item)">
      {{ item }}
    </span>
  </div>
</template>

<script lang="ts">
import useSelectedTags from '@/stores/tag-cloud';
import { defineComponent, type PropType } from 'vue';

const { getSelected, setSelected } = useSelectedTags();

const tagCloud = defineComponent({
  name: 'TagCloud',

  data() {
    return {
      selected: [] as string[],
    };
  },

  props: {
    tags: {
      type: Object as PropType<string[]>,
      required: true,
    },
  },

  computed: {
    isAdmin() {
      return this.$route.name === 'admin';
    },
  },

  mounted() {
    this.selected = getSelected();
  },

  methods: {
    isHas(tag: string) {
      return this.selected.includes(tag);
    },

    select(tag: string) {
      const i = this.selected.indexOf(tag);
      if (i !== -1) {
        this.selected.splice(i, 1);
      } else {
        this.selected.push(tag);
      }

      setSelected(this.selected);
      this.$emit('tags');
    },

    clearSelected() {
      this.selected = [] as string[];

      setSelected(this.selected);
    },
  },
});
export default tagCloud;
export type TagCloudElement = InstanceType<typeof tagCloud>;
</script>

<style>
.tags {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--gap) / 2);
  color: var(--color-text);
}

.tags-center {
  justify-content: center;
}

.tags_admin {
  grid-area: A;
  overflow-y: auto;
}

.tag {
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  color: inherit;
  background-color: var(--color-background);
  transition: background-color 0.3s ease, color 0.5s ease;
  border-radius: 1rem;
}

.tag:hover,
.active {
  color: var(--color-text-inverse);
  background-color: var(--color-background-inverse);
}
</style>
