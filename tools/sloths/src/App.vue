<template>
  <header-view />

  <main class="main">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </main>

  <footer-view />

  <background-view />
  <loader-view v-show="isLoad" />

  <alert-modal v-show="isAlert" :header="header" :message="message" @closeAlertModal="isAlert = false"></alert-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { CDN_URL, CLEANED_JSON_URL } from '@/common/const';
import HeaderView from './components/header/HeaderView.vue';
import FooterView from './components/footer/FooterView.vue';
import LoaderView from './components/loader/LoaderView.vue';
import BackgroundView from './components/background/BackgroundView.vue';
import AlertModal from './components/modal/AlertModal.vue';
import AuthorizationModal from './components/modal/AuthorizationModal.vue';

import useLoader from './stores/loader';
import useAlertModal from './stores/alert-modal';
import useAuthorizationModal from './stores/authorization-modal';
import useAudioOn from './stores/audio-on';
import useCleanedStore from './stores/cleaned';

export default defineComponent({
  name: 'App',

  components: {
    HeaderView,
    FooterView,
    LoaderView,
    BackgroundView,
    AlertModal,
    AuthorizationModal,
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),
    ...mapWritableState(useAlertModal, ['isAlert', 'header', 'message']),
    ...mapWritableState(useAuthorizationModal, ['isAuthorization']),
    ...mapWritableState(useAudioOn, ['isAudioOn']),
    ...mapWritableState(useCleanedStore, ['cleanedFilelist']),
  },

  created() {
    this.isAlert = false;
    this.header = 'modal.header.alert';
    this.message = '';
    this.$i18n.locale = 'en';
  },

  async mounted() {
    this.isLoad = true;
    try {
      await this.getCleaned();
    } catch (error: string | unknown) {
      throw new Error(error as string);
    } finally {
      this.isLoad = false;
    }
  },

  methods: {
    async getCleaned(): Promise<void> {
      try {
        const response = await fetch(CLEANED_JSON_URL);

        if (response.status === 200) {
          const data: string[] = await response.json();
          this.cleanedFilelist = data.map((file) => `${CDN_URL}/cleaned/${file}`);
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
