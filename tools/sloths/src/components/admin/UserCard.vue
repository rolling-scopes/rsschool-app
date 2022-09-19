<template>
  <div class="user-info">
    <div class="user-info__user">
      <img class="user-info__img" :src="getAvatar" :alt="userInfo.name" />
    </div>
    <div class="user-info__btn">
      <custom-btn className="btn btn-icon icon-edit" @click="$emit('editUser', userInfo)"></custom-btn>
      <custom-btn className="btn btn-icon icon-del" @click="delItem"></custom-btn>
    </div>
    <div class="user-info__props">
      <p class="user-info__property">{{ $t('profile.name') }}</p>
      <p class="user-info__property">{{ $t('profile.github') }}</p>
      <p class="user-info__property">{{ $t('profile.role') }}</p>
      <p class="user-info__property">{{ $t('profile.createdAt') }}</p>
    </div>
    <div class="user-info__props">
      <p class="user-info__property">{{ userInfo.name }}</p>
      <p class="user-info__property">{{ userInfo.github }}</p>
      <p class="user-info__property">{{ userInfo.role }}</p>
      <p class="user-info__property">{{ new Date(userInfo.createdAt).toLocaleDateString() }}</p>
    </div>
    <modal-window v-show="isApproveShow" @close="closeModal">
      <template v-slot:header> {{ $t('modal.header.alert') }} </template>

      <template v-slot:body> {{ $t('modal.body.del-user') }} </template>

      <template v-slot:footer>
        <div class="user-info__btn btn-horizontal">
          <custom-btn :text="$t('btn.yes')" className="btn btn-primary" :onClick="approveDelItem"></custom-btn>
          <custom-btn :text="$t('btn.no')" className="btn btn-primary" :onClick="closeModal"></custom-btn>
        </div>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { User } from '@/common/types';
import { DEFAULT_USER_AVATAR } from '@/common/const';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';

export default defineComponent({
  name: 'UserCard',

  components: {
    CustomBtn,
    ModalWindow,
  },

  data() {
    return { isApproveShow: false };
  },

  props: {
    userInfo: {
      type: Object as PropType<User>,
      required: true,
    },
  },

  computed: {
    getAvatar(): string {
      return this.userInfo.avatar_url ?? DEFAULT_USER_AVATAR;
    },
  },

  methods: {
    delItem() {
      this.isApproveShow = true;
    },
    approveDelItem() {
      this.$emit('delUser', this.userInfo.id);
      this.closeModal();
    },
    closeModal() {
      this.isApproveShow = false;
    },
  },
});
</script>

<style scoped>
.user-info {
  padding: 0.5rem;
  overflow: hidden;

  width: calc(50% - var(--gap));

  display: flex;
  align-items: center;
  gap: var(--gap);

  background-color: var(--color-background-soft);
  border: 1px solid gray;
  border-radius: 0.5rem;
}
.user-info:hover {
  box-shadow: 0px 0px 0.5rem gray;
}

.user-info__img {
  width: calc(10rem - 1rem);
  height: calc(10rem - 1rem);
  object-fit: contain;
}

.user-info__props {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-info__property {
  padding: 0.25rem;
}

.user-info__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
}
.btn-horizontal {
  flex-direction: row;
}

@media (max-width: 1000px) {
  .user-info {
    width: 100%;
  }
}
</style>
