<template>
  <div class="pagination">
    <div class="pagination__per-page">
      <label class="pagination__label" for="perPage">{{ $t('pagination.perPage') }}: </label>
      <select
        class="pagination__select select-element"
        name="perPage"
        id="perPage"
        v-model="perPage"
        @change="setPerPage"
      >
        <option v-for="item in perPageArr" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>
    <div class="pagination__btns">
      <custom-btn
        :text="$t('pagination.top')"
        :title="$t('pagination.topTitle')"
        className="btn btn-pagination"
        @click="goTop"
        v-shortkey="['home']"
        @shortkey="goTop"
        :disabled="top"
      ></custom-btn>
      <custom-btn
        :text="$t('pagination.prev')"
        :title="$t('pagination.prevTitle')"
        className="btn btn-pagination"
        @click="goPrev"
        v-shortkey="['pageup']"
        @shortkey="goPrev"
        :disabled="top"
      ></custom-btn>

      <div class="pagination__page">
        <span>{{ currPageNumber }}</span>
      </div>

      <custom-btn
        :text="$t('pagination.next')"
        :title="$t('pagination.nextTitle')"
        className="btn btn-pagination"
        @click="goNext"
        v-shortkey="['pagedown']"
        @shortkey="goNext"
        :disabled="bottom"
      ></custom-btn>
      <custom-btn
        :text="$t('pagination.bottom')"
        :title="$t('pagination.bottomTitle')"
        className="btn btn-pagination"
        @click="goBottom"
        v-shortkey="['end']"
        @shortkey="goBottom"
        :disabled="bottom"
      ></custom-btn>
    </div>
    <div class="pagination__count">
      <h3 class="pagination__value">{{ $t('pagination.count') }}: {{ size }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { PAGINATION_OPTIONS } from '@/common/const';
import usePagination from '@/stores/pagination';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import { defineComponent } from 'vue';

const { getPerPage, getCurrPage, setPerPage, setCurrPage } = usePagination();

const paginationList = defineComponent({
  name: 'PaginationList',

  components: {
    CustomBtn,
  },

  data() {
    return {
      perPageArr: PAGINATION_OPTIONS,
      perPage: getPerPage(),
      currPageNumber: getCurrPage(),
    };
  },

  props: {
    size: {
      type: Number,
      required: true,
    },
  },

  computed: {
    pagesCount(): number {
      return Math.ceil(this.size / this.perPage);
    },

    top(): boolean {
      return this.currPageNumber === 1;
    },

    bottom(): boolean {
      return this.currPageNumber === this.pagesCount;
    },
  },

  methods: {
    getPage() {
      setCurrPage(this.currPageNumber);
      setPerPage(this.perPage);
      this.$emit('getPage');
    },

    setPerPage() {
      this.currPageNumber = 1;
      this.getPage();
    },

    goTop() {
      if (!this.top) {
        this.currPageNumber = 1;
        this.getPage();
      }
    },

    goNext() {
      if (!this.bottom) {
        if (this.currPageNumber < this.pagesCount) this.currPageNumber += 1;
        this.getPage();
      }
    },

    goPrev() {
      if (!this.top) {
        if (this.currPageNumber > 1) this.currPageNumber -= 1;
        this.getPage();
      }
    },

    goBottom() {
      if (!this.bottom) {
        this.currPageNumber = this.pagesCount;
        this.getPage();
      }
    },
  },
});
export default paginationList;
export type PaginationListElement = InstanceType<typeof paginationList>;
</script>

<style>
.pagination {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: var(--gap);
}

.pagination__per-page {
  flex: 1;
}

.pagination__select {
  width: 5rem;
  text-align: center;
  color: inherit;
  background-color: var(--color-background);
}

.pagination__btns {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
}

.pagination__page {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-background);
}

.pagination__page span {
  font-weight: bold;
}

.pagination__count {
  flex: 1;
}

.pagination__value {
  text-align: right;
}

@media (max-width: 1100px) {
  .pagination {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(2, auto);
    grid-template-areas:
      'A B'
      'C C';
    justify-content: center;
    gap: 1rem;
  }

  .pagination__per-page {
    grid-area: A;
  }

  .pagination__count {
    grid-area: B;
  }

  .pagination__btns {
    grid-area: C;
  }
}
</style>
