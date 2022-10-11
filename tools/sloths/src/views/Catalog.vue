<template>
  <div class="catalog">
    <div class="catalog__aside list-aside">
      <image-btn
        :imgPath="`./img/catalog/download-${currTheme}.svg`"
        :disabled="!someChecked"
        :text="$t('btn.download')"
        className="btn btn-img btn-download"
        @click="downloadFiles"
      ></image-btn>
      <controls-list
        @search="getSloths"
        @tags="getSloths"
        @sorting="getSloths"
        @clearAll="getSloths"
        :placeholder="$t('catalog.search')"
        :tags="tags"
        :title="$t('catalog.sorting')"
        :options="sortingOptions"
        :text="$t('btn.reset')"
      >
      </controls-list>
      <image-btn
        :text="$t('merch.title')"
        :imgPath="'./img/home/merch.svg'"
        className="btn btn-img btn-merch"
        @click="$router.push({ name: 'merch' })"
      ></image-btn>
    </div>
    <div class="catalog__main list-main">
      <pagination-list ref="pagination" :size="count" @getPage="getSloths"></pagination-list>
      <div class="catalog__list">
        <sloth-card
          v-for="sloth in sloths"
          :key="sloth.id"
          :slothInfo="sloth"
          @showSloth="showSlothInfoView"
          @checkSloth="checkSlothInfoView"
        ></sloth-card>
      </div>
      <sloth-info
        :isSlothInfoVisible="isSlothInfoVisible"
        :headerText="$t('catalog.info')"
        @closeSlothInfo="closeSlothInfo"
      ></sloth-info>
    </div>
    <modal-window v-show="isDownloadShow" @close="closeModal">
      <template v-slot:header> {{ $t('modal.body.download') }} </template>

      <template v-slot:body>
        <div class="catalog__download">
          <sloth-card
            v-for="sloth in checked"
            :key="sloth.name"
            :slothInfo="sloth"
            :isDownload="true"
            @checkSloth="checkSlothInfoView"
          ></sloth-card>
        </div>
      </template>

      <template v-slot:footer>
        <div class="catalog__btn">
          <custom-btn
            :text="$t('btn.yes')"
            className="btn btn-primary"
            :onClick="approveDownload"
            :disabled="!someChecked"
          ></custom-btn>
          <custom-btn :text="$t('btn.no')" className="btn btn-primary" :onClick="closeModal"></custom-btn>
        </div>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import themeProp from '@/stores/theme';
import type { PageSettings, Sloth } from '@/common/types';
import { errorHandler } from '@/services/error-handler';
import { CDN_STICKERS_URL, PAGINATION_OPTIONS, SLOTH_SORTING } from '@/common/const';
import { SlothsService } from '@/services/sloths-service';
import useLoader from '@/stores/loader';
import usePagination from '@/stores/pagination';
import useSearchText from '@/stores/search-text';
import useSelectedTags from '@/stores/tag-cloud';
import useSortingList from '@/stores/sorting-list';
import useSlothInfo from '@/stores/sloth-info';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import ImageBtn from '@/components/buttons/ImageBtn.vue';
import ControlsList from '@/components/controls-list/ControlsList.vue';
import PaginationList, { type PaginationListElement } from '@/components/controls-list/PaginationList.vue';
import SlothCard from '@/components/catalog/SlothCard.vue';
import SlothInfo from '@/components/catalog/SlothInfo.vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import usePagesStore from '@/stores/pages-store';
import useSlothsStore from '@/stores/sloths';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const { setSlothInfo } = useSlothInfo();

const { getPerPage, getCurrPage, setPerPage, setCurrPage } = usePagination();
const { getSearchText, setSearchText } = useSearchText();
const { getSelected, setSelected } = useSelectedTags();
const { getSortingList, setSortingList } = useSortingList();
const { getPageCatalogState, setPageCatalogState } = usePagesStore();

const { sloths } = useSlothsStore();
const service = new SlothsService(sloths);

export default defineComponent({
  name: 'CatalogView',

  components: {
    CustomBtn,
    ImageBtn,
    SlothCard,
    SlothInfo,
    ControlsList,
    PaginationList,
    ModalWindow,
  },

  data() {
    return {
      sloths: [] as Sloth[],
      count: 0,
      isSlothInfoVisible: false,
      tags: [] as string[],
      sortingOptions: SLOTH_SORTING,
      isDownloadShow: false,
      checked: [] as Sloth[],
    };
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),
    ...mapWritableState(themeProp, ['currTheme']),

    someChecked(): boolean {
      return this.checked.some((el) => el.checked);
    },
  },

  created() {
    this.loadStore();
  },

  async mounted() {
    await this.getSloths();
  },

  beforeUnmount() {
    this.saveStore();
  },

  watch: {
    someChecked(newVal) {
      if (!newVal) {
        this.isDownloadShow = false;
      }
    },
  },

  methods: {
    async getSloths() {
      this.isLoad = true;
      try {
        const page = getCurrPage();
        const limit = getPerPage();
        const searchText = getSearchText();
        const selected = getSelected();
        const sorting = getSortingList();

        const res = await service.getAll({
          page: `${page}`,
          limit: `${limit}`,
          order: sorting,
          searchText,
          filter: selected.join(','),
        });

        this.sloths = res.data.items;
        this.count = res.data.count;

        if (!this.sloths.length && page !== 1) {
          const pagination = this.$refs.pagination as PaginationListElement;
          if (pagination) pagination.goTop();
        }

        this.setChecked();

        await this.getTags();

        this.saveStore();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async getTags() {
      this.isLoad = true;
      try {
        const res = service.getTags();

        if (!res) throw new Error(this.$t('catalog.tagsNotFound'));

        this.tags = res.slice();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    checkSlothInfoView(sloth: Sloth) {
      let slothIndex = this.sloths.indexOf(sloth);
      if (slothIndex !== -1) this.sloths[slothIndex].checked = !this.sloths[slothIndex].checked;

      slothIndex = this.checked.findIndex((el) => el.id === sloth.id);
      if (slothIndex !== -1) {
        this.checked.splice(slothIndex, 1);
      } else {
        this.checked.push(sloth);
      }

      this.saveStore();
    },

    setChecked() {
      this.sloths.forEach((sloth) => {
        const slothIndex = this.checked.findIndex((el) => el.id === sloth.id);
        this.sloths[this.sloths.indexOf(sloth)].checked = slothIndex !== -1;
      });
    },

    async showSlothInfoView(sloth: Sloth) {
      this.isLoad = true;
      try {
        const res = await service.getById(sloth.id);

        if (!res) throw new Error(`${this.$t('catalog.idNotFound')} (${sloth.id})`);

        const dataSloth = res;
        const slothIndex = this.sloths.findIndex((el) => el.id === sloth.id);

        if (slothIndex !== -1) this.sloths[slothIndex] = dataSloth;

        setSlothInfo(dataSloth);
        this.showSlothInfo();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    showSlothInfo() {
      this.isSlothInfoVisible = true;
    },

    closeSlothInfo() {
      this.isSlothInfoVisible = false;
    },

    downloadFiles() {
      if (this.checked.length) this.isDownloadShow = true;
    },

    async approveDownload() {
      const forDownload = this.checked.filter((el) => el.checked).map((el) => el.id);

      if (!forDownload.length) return;

      // download
      await this.downloadZip(forDownload);

      this.closeModal();
    },

    async downloadZip(ids: string[]) {
      const zip = JSZip();
      const zipFilename = `sloths_${new Date().toISOString()}.zip`;

      ids.forEach((id) => {
        const blobPromise = fetch(`${CDN_STICKERS_URL}/${id}/image.svg`).then((r) => {
          if (r.status === 200) return r.blob();
          return Promise.reject(new Error(r.statusText));
        });
        zip.file(`${id}.svg`, blobPromise);
      });

      zip
        .generateAsync({ type: 'blob' })
        .then((blob) => saveAs(blob, zipFilename))
        .catch((e) => errorHandler(e));
    },

    closeModal() {
      this.setChecked();
      this.isDownloadShow = false;
    },

    saveStore() {
      const savedProps = {
        currPage: getCurrPage(),
        perPage: getPerPage(),
        searchText: getSearchText(),
        selected: getSelected(),
        sorting: getSortingList(),
        checked: this.checked.filter((el) => el.checked).map((el) => el.id),
      };
      setPageCatalogState(JSON.stringify(savedProps));
    },

    loadStore() {
      const settings: PageSettings = {
        currPage: 1,
        perPage: PAGINATION_OPTIONS[0],
        searchText: '',
        selected: [] as string[],
        sorting: SLOTH_SORTING[0].value,
        checked: [] as string[],
      };

      const str = getPageCatalogState();
      if (str) {
        const data = JSON.parse(str);
        if (data) {
          settings.currPage = data.currPage;
          settings.perPage = data.perPage;
          settings.searchText = data.searchText;
          settings.selected = data.selected;
          settings.sorting = data.sorting;
          settings.checked = data.checked;
        }
      }

      setCurrPage(settings.currPage);
      setPerPage(settings.perPage);
      setSearchText(settings.searchText);
      setSelected(settings.selected);
      setSortingList(settings.sorting);

      const { checked } = settings;
      checked?.forEach((id: string) => {
        const found = this.sloths.find((el) => el.id === id);
        if (found) found.checked = true;
      });
    },
  },
});
</script>

<style scoped>
.catalog {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 2rem;
  color: var(--color-text);
}

.catalog__main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--gap-2);
}

.catalog__aside {
  padding: 1rem;
}

.catalog__list {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.catalog__download {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--gap);

  max-height: 50rem;
  overflow: scroll;
}

.catalog__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
}

@media (max-width: 768px) {
  .catalog {
    flex-direction: column;
  }
}
</style>
