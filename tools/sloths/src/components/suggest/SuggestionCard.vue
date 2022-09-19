<template>
  <div :class="`${getPageName}-suggest-info`">
    <div v-if="isAdmin" class="admin-suggest-info__inner">
      <div class="admin-suggest-info__suggest">
        <img class="admin-suggest-info__img" :src="getImage" alt="suggestion" />
      </div>
      <div class="suggest-info__btn">
        <custom-btn className="btn btn-icon icon-edit" @click="$emit('editSuggest', suggestInfo)"></custom-btn>
        <custom-btn className="btn btn-icon icon-del" @click="delItem"></custom-btn>
      </div>
      <div class="admin-suggest-info__props">
        <p class="suggest-info__property">{{ $t('suggest.description') }}</p>
        <p class="suggest-info__property">{{ $t('suggest.status') }}</p>
        <p class="suggest-info__property">{{ $t('suggest.rating') }}</p>
        <p class="suggest-info__property">{{ $t('suggest.createdAt') }}</p>
      </div>
      <div class="admin-suggest-info__props">
        <p class="suggest-info__property cut-text">{{ suggestInfo.description }}</p>
        <p class="suggest-info__property">{{ suggestInfo.status }}</p>
        <p v-show="suggestInfo.rating === 0" class="suggest-info__property">0</p>
        <p class="suggest-info__property">
          <img
            v-for="item in Math.floor(suggestInfo.rating) || 0"
            :key="item"
            src="/img/catalog/sloths.svg"
            alt="sloths"
            class="suggest-info__text__sloth"
            :title="`${(suggestInfo.rating || 0).toFixed(1)}`"
          />
          <img
            v-show="suggestInfo.rating - Math.floor(suggestInfo.rating) !== 0"
            src="/img/catalog/sloths.svg"
            alt="sloths"
            class="suggest-info__text__sloth"
            :title="`${(suggestInfo.rating || 0).toFixed(1)}`"
            :style="{
              height: '20px',
              width: 22 * (suggestInfo.rating - Math.floor(suggestInfo.rating)) + 'px',
              overflowX: 'hidden',
              objectFit: 'cover',
              objectPosition: 'left center',
            }"
          />
        </p>
        <p class="suggest-info__property">
          {{ new Date(suggestInfo.createdAt).toLocaleDateString() }}
        </p>
      </div>
    </div>
    <div v-if="isSuggest || isProfile" class="suggest-suggest-info__inner">
      <div class="suggest-suggest-info__suggest">
        <img class="suggest-suggest-info__img" :src="getImage" alt="suggestion" />
      </div>
      <div>
        <div class="suggest-suggest-info__props">
          <p class="suggest-info__property cut-text">{{ suggestInfo.description }}</p>
          <p class="suggest-info__property">{{ suggestInfo.status }}</p>
          <div class="suggest-info__property suggest-info__property_rating">
            <p v-if="suggestInfo.rating === 0" class="suggest-info__user-rate">
              <span class="user-rate__main">{{ $t('rate.none') }}</span>
            </p>
            <p v-else class="suggest-info__user-rate">
              <img
                v-for="item in Math.floor(suggestInfo.rating)"
                :key="item"
                src="/img/catalog/sloths.svg"
                alt="sloths"
                class="user-rate__sloth"
                :title="`${suggestInfo.rating.toFixed(1)}`"
              />
              <img
                v-show="suggestInfo.rating - Math.floor(suggestInfo.rating) !== 0"
                src="/img/catalog/sloths.svg"
                alt="sloths"
                class="user-rate__sloth"
                :title="`${suggestInfo.rating.toFixed(1)}`"
                :style="{
                  height: '40px',
                  width: 44 * (suggestInfo.rating - Math.floor(suggestInfo.rating)) + 'px',
                  overflowX: 'hidden',
                  objectFit: 'cover',
                  objectPosition: 'left center',
                }"
              />
            </p>
          </div>
          <div class="suggest-info__property suggest-info__property_rate" v-show="isSuggest">
            <label for="range" class="suggest-info__label">{{ $t('rate.your') }}</label>
            <select
              class="suggest-info__select"
              name="range"
              id="range"
              v-model="newRating"
              @change="$emit('editRating', suggestInfo, +newRating)"
            >
              <option v-for="value in rateValues" :key="value" :value="value">{{ value }}</option>
            </select>
          </div>
        </div>
      </div>
      <custom-btn
        :text="$t('btn.show')"
        className="btn btn-primary"
        @click="$emit('showSuggest', suggestInfo)"
      ></custom-btn>
    </div>
    <modal-window v-show="isApproveShow" @close="closeModal">
      <template v-slot:header> {{ $t('modal.header.alert') }} </template>

      <template v-slot:body> {{ $t('modal.body.del-suggest') }} </template>

      <template v-slot:footer>
        <div class="suggest-info__btn btn-horizontal">
          <custom-btn :text="$t('btn.yes')" className="btn btn-primary" :onClick="approveDelItem"></custom-btn>
          <custom-btn :text="$t('btn.no')" className="btn btn-primary" :onClick="closeModal"></custom-btn>
        </div>
      </template>
    </modal-window>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Suggestion } from '@/common/types';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import ModalWindow from '@/components/modal/ModalWindow.vue';
import { BASE, DEFAULT_USER_AVATAR, RATING_OPTIONS } from '@/common/const';

export default defineComponent({
  name: 'SuggestionCard',

  components: {
    CustomBtn,
    ModalWindow,
  },

  data() {
    return {
      newRating: this.suggestInfo.ratings[0]?.rate ?? 0,
      isApproveShow: false,
      rateValues: RATING_OPTIONS,
    };
  },

  props: {
    suggestInfo: {
      type: Object as PropType<Suggestion>,
      required: true,
    },
  },

  computed: {
    getPageName() {
      return this.$route.name === 'admin' ? 'admin' : 'suggest';
    },

    isAdmin() {
      return this.$route.name === 'admin';
    },

    isSuggest() {
      return this.$route.name === 'suggest';
    },

    isProfile() {
      return this.$route.name === 'profile';
    },

    getImage() {
      return this.suggestInfo.image_url ? `${BASE}/${this.suggestInfo.image_url}` : DEFAULT_USER_AVATAR;
    },
  },

  methods: {
    delItem() {
      this.isApproveShow = true;
    },
    approveDelItem() {
      this.$emit('delSuggest', this.suggestInfo.id);
      this.closeModal();
    },
    closeModal() {
      this.isApproveShow = false;
    },
  },
});
</script>

<style scoped>
.suggest-suggest-info,
.admin-suggest-info {
  overflow: hidden;
  background-color: var(--color-background-soft);
  border: 1px solid gray;
}

.admin-suggest-info {
  padding: 0.5rem;
  width: calc(50% - var(--gap));
  border-radius: 0.5rem;
}

.suggest-suggest-info {
  position: relative;
  padding: 1rem;
  width: 30rem;
  border-radius: 1rem;
}

.admin-suggest-info:hover,
.suggest-suggest-info:hover {
  box-shadow: 0px 0px 0.5rem gray;
}

.suggest-suggest-info__inner,
.admin-suggest-info__inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.suggest-suggest-info__inner {
  flex-direction: column;
}

.suggest-suggest-info__suggest {
  position: relative;
  overflow: hidden;
}

.admin-suggest-info__img {
  width: calc(10rem - 1rem);
  height: calc(10rem - 1rem);
  object-fit: contain;
}

.suggest-suggest-info__img {
  width: calc(20rem - 2rem);
  height: calc(20rem - 2rem);
  object-fit: contain;
}

.admin-suggest-info__props,
.suggest-suggest-info__props {
  display: flex;
  flex-direction: column;
}

.admin-suggest-info__props {
  align-items: flex-start;
}

.suggest-suggest-info__props {
  align-items: center;
}

.suggest-info__property {
  padding: 0.25rem;
}

.cut-text {
  width: 28rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggest-info__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
}

.btn-horizontal {
  flex-direction: row;
}

.suggest-info__text__sloth {
  height: 2rem;
}

.suggest-info__property_rating {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggest-info__user-rate {
  display: flex;
  justify-content: center;
  align-items: center;
}

.suggest-info__rating {
  text-transform: uppercase;
}

.user-rate__main {
  font-size: 2rem;
}

.user-rate__sloth {
  height: 4rem;
}

.suggest-info__property_rate {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.suggest-info__select {
  padding: 0.5rem;
  border: 0.2rem solid var(--color-border-inverse-soft);
  background-color: var(--color-background);
  color: inherit;
  width: 5rem;
  border-radius: 1rem;
  transition: 0.5s ease;
}

@media (max-width: 1000px) {
  .admin-suggest-info {
    width: 100%;
  }
}
</style>
