<template>
  <div class="profile">
    <aside class="profile__aside">
      <user-info :adminPanel="false" @updUser="updUser"></user-info>
      <custom-btn :text="$t('profile.btn.logout')" className="btn btn-link" :onClick="logOut"></custom-btn>
      <router-link v-show="isAdmin" to="/admin">
        <custom-btn :text="$t('profile.btn.admin')" className="btn btn-link"></custom-btn>
      </router-link>
    </aside>
    <main class="profile__main">
      <div class="profile__tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['btn btn-tab', { 'btn-tab_active': currentGame === index }]"
          @click="currentGame = index"
        >
          {{ $t(`profile.btn.${tab}`) }}
        </div>
      </div>
      <component :is="components[currentGame]" class="profile__tab" :userId="getUserId"></component>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapWritableState } from 'pinia';
import type { User } from '@/common/types';
import { errorHandler } from '@/services/error-handling/error-handler';
import { UsersService } from '@/services/users-service';
import useLoader from '@/stores/loader';
import UserInfo from '@/components/profile/UserInfo.vue';
import MemoryInfo from '@/components/profile/MemoryInfo.vue';
import GuessInfo from '@/components/profile/GuessInfo.vue';
import SuggestInfo from '@/components/profile/SuggestInfo.vue';
import SlothToday from '@/components/profile/SlothToday.vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import HomeCategory from '@/components/home/HomeCategory.vue';
import useCurrUser from '@/stores/curr-user';
import { BASE } from '@/common/const';

const { setClearUser } = useCurrUser();

export default defineComponent({
  name: 'ProfileView',

  components: {
    UserInfo,
    MemoryInfo,
    GuessInfo,
    SuggestInfo,
    CustomBtn,
    HomeCategory,
    SlothToday,
  },

  data() {
    return {
      currentGame: 0,
      tabs: ['memory', 'guess', 'suggest', 'sloth'],
      components: ['MemoryInfo', 'GuessInfo', 'SuggestInfo', 'SlothToday'],
    };
  },

  computed: {
    ...mapState(useCurrUser, ['isAdmin', 'getUserId', 'hasAuth', 'currUser']),
    ...mapWritableState(useLoader, ['isLoad']),
  },

  methods: {
    async updUser(user: User) {
      this.isLoad = true;
      try {
        const res = await UsersService.updateProfile(this.currUser);

        if (!res.ok) throw Error();
      } catch (error) {
        errorHandler(error);
      } finally {
        this.isLoad = false;
      }
    },

    async logOut() {
      try {
        await fetch(`${BASE}/auth/github/logout`, {
          method: 'GET',
          credentials: 'include',
          mode: 'no-cors',
        });

        setClearUser();
        this.$router.push({ name: 'home' });
      } catch (error: string | unknown) {
        throw new Error(error as string);
      }
    },
  },
});
</script>

<style scoped>
.profile {
  display: grid;
  grid-template-columns: 300px auto;
}

.profile__aside {
  width: var(--width-panel);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile__main {
  padding: 1rem;
}

.profile__tabs {
  display: flex;
  gap: 3px;
}

.profile__tab {
  border: 1px solid var(--color-border-inverse);
  border-radius: 0 0 0.5rem 0.5rem;
  padding: 1rem;
  margin-left: 0.1rem;
  color: var(--color-text);
}

@media (max-width: 1200px) {
  .profile__main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .profile__tabs {
    flex-direction: column;
  }

  .profile__tab {
    border-radius: 0.5rem;
    margin-left: 0;
  }
}
</style>
