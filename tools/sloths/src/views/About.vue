<template>
  <div class="about">
    <img class="about__logo" src="/img/logo.svg" alt="logo" />
    <about-section
      v-for="(section, i) in sections"
      :key="`${section}`"
      :section="section"
      :softClass="i % 2 ? 'left' : 'right'"
      :index="i"
    ></about-section>

    <section class="about__teammates">
      <img class="about__wwt" :src="`/img/team/wwt.svg`" alt="wwt" />
      <div class="about__team">{{ $t(`about.teammates.main`) }}</div>
      <div class="about__teammates__wrap">
        <about-teammate v-for="teammate in teammates" :key="`${teammate}`" :teammate="teammate"></about-teammate>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import AboutSection from '@/components/about/AboutSection.vue';
import AboutTeammate from '@/components/about/AboutTeammate.vue';

export default {
  name: 'AboutView',

  data() {
    return {
      sections: ['sloths', 'interactives'],
      teammates: ['wiijoy', 'ogimly', 'vanet'],
    };
  },

  components: {
    AboutSection,
    AboutTeammate,
  },
};
</script>

<style scoped>
.about {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.about__logo,
.about__wwt {
  display: block;
  margin: 0 auto;
}

.about__log {
  height: 50rem;
}

.about__wwt {
  width: 40rem;
}

.about__team {
  font-size: 2.2rem;
  line-height: 3.2rem;
  color: var(--color-text);
}

.about__teammates {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.about__teammates__wrap {
  display: flex;
  justify-content: space-evenly;
  gap: 5rem;
}

@media (max-width: 1200px) {
  .about {
    padding: 3rem 0;
    width: 95%;
    margin: 0 auto;
  }

  .about__wwt {
    width: 32rem;
  }

  .about__teammates__wrap {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .about {
    width: 90%;
  }

  .about__teammates__wrap {
    gap: 7rem;
  }

  .about__log {
    height: 40rem;
  }

  .about__wwt {
    width: 28rem;
  }
}
</style>
