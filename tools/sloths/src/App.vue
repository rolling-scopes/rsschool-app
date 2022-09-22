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
import HeaderView from './components/header/HeaderView.vue';
import FooterView from './components/footer/FooterView.vue';
import LoaderView from './components/loader/LoaderView.vue';
import BackgroundView from './components/background/BackgroundView.vue';
import AlertModal from './components/modal/AlertModal.vue';

import useLoader from './stores/loader';
import useAlertModal from './stores/alert-modal';
import useAudioOn from './stores/audio-on';

export default defineComponent({
  name: 'App',

  components: {
    HeaderView,
    FooterView,
    LoaderView,
    BackgroundView,
    AlertModal,
  },

  computed: {
    ...mapWritableState(useLoader, ['isLoad']),
    ...mapWritableState(useAlertModal, ['isAlert', 'header', 'message']),
    ...mapWritableState(useAudioOn, ['isAudioOn']),
  },

  created() {
    this.isAlert = false;
    this.header = 'modal.header.alert';
    this.message = '';
    this.$i18n.locale = 'en';
  }
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
