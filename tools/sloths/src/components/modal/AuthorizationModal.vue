<template>
  <div class="authorization-modal">
    <div class="background">
      <modal-window @close="closeModal">
        <template v-slot:header> {{ $t('modal.header.authorization') }} </template>

        <template v-slot:body>
          <div class="authorization-modal__body">
            <img :src="imgGitHub" alt="GitHub" />
            <p>{{ $t('modal.body.authorization') }}</p>
          </div>
        </template>

        <template v-slot:footer>
          <div class="btn btn-primary">
            <a class="btn__text" :href="url">{{ $t('modal.btn.authorization') }}</a>
          </div>
        </template>
      </modal-window>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import { AUTHORIZATION_IMG, AUTHORIZATION_URL } from '@/common/const';

export default defineComponent({
  name: 'AuthorizationModal',

  components: {
    ModalWindow,
  },

  data() {
    return {
      imgGitHub: AUTHORIZATION_IMG,
      url: AUTHORIZATION_URL,
    };
  },

  methods: {
    closeModal() {
      this.$emit('closeAuthorizationModal');
    },
  },
});
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  background-color: var(--dark-opacity);
}
.authorization-modal__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.authorization-modal__body p {
  width: 200px;
  text-align: center;
}
</style>
