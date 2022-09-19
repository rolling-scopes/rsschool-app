<template>
  <div class="home">
    <home-about></home-about>
    <home-catalog @click="handleCategoryClick('catalog')"></home-catalog>
    <div class="home__menu">
      <home-category
        v-for="(category, i) in categories"
        :key="`${i}_${category}`"
        :category="category"
        @click="hasAuth ? handleCategoryClick(category) : handleAuth()"
      ></home-category>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import HomeCategory from '../components/home/HomeCategory.vue';
import HomeAbout from '../components/home/HomeAbout.vue';
import HomeCatalog from '../components/home/HomeCatalog.vue';

import useCurrUser from '../stores/curr-user';
import useAuthorizationModal from '../stores/authorization-modal';

export default defineComponent({
  name: 'HomeView',

  components: {
    HomeCategory,
    HomeAbout,
    HomeCatalog,
  },

  data(): { categories: string[] } {
    return {
      categories: ['profile', 'memory', 'guess', 'create', 'suggest', 'merch'],
    };
  },

  computed: {
    ...mapState(useCurrUser, ['hasAuth']),
    ...mapWritableState(useAuthorizationModal, ['isAuthorization']),
  },

  methods: {
    handleCategoryClick(category: string): void {
      this.$router.push({ name: `${category}` });
    },

    handleAuth() {
      this.isAuthorization = true;
    },
  },
});
</script>

<style scoped>
.home {
  height: 100%;
  display: grid;
  gap: 8rem;
  justify-items: center;
  align-items: center;
  justify-content: center;
  grid-template-columns: 30rem 40rem 30rem;
  margin: 0 auto;
  padding: 2rem 0;
}

.home__menu {
  display: grid;
  justify-items: center;
  justify-content: center;
  grid-template-columns: repeat(2, 14rem);
  grid-template-rows: repeat(3, 17rem);
  gap: 5rem 1rem;
}

@media (max-width: 1200px) {
  .home {
    grid-template-columns: 30rem 40rem;
    grid-template-rows: 50rem auto;
    gap: 5rem 3rem;
    grid-template-areas:
      'A B'
      'C C';
  }

  .home__menu {
    grid-area: C;
    grid-template-columns: repeat(3, 14rem);
    grid-template-rows: repeat(2, 17rem);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .home {
    grid-template-columns: 40rem;
    grid-template-rows: auto;
    gap: 2rem;
    grid-template-areas:
      'B'
      'C'
      'A';
  }

  .home__menu {
    grid-template-columns: repeat(2, 14rem);
    grid-template-rows: repeat(3, 17rem);
    gap: 1.5rem;
  }
}
</style>
