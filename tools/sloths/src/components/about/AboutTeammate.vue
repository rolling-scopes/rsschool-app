<template>
  <div class="teammate">
    <img class="teammate__photo" :src="`/img/photo/${teammate}.png`" alt="photo" />
    <div class="teammate__wrap">
      <div class="teammate__main">{{ teammate }}</div>
      <div class="teammate__descr">{{ $t(`about.teammates.${teammate}`) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AboutTeammate',

  props: {
    teammate: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>
.teammate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
}

.teammate__photo {
  border-radius: 50%;
  border: 0.5rem solid var(--color-border-inverse);
  height: 25rem;
  transition: 0.5s ease;
}

.teammate__wrap {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.teammate__main {
  font-size: 2.8rem;
  color: var(--color-heading);
  text-transform: uppercase;
  text-align: center;
  transition: 0.5s ease;
}

.teammate__descr {
  font-size: 2.2rem;
  line-height: 3.2rem;
  color: var(--color-text);
  transition: 0.5s ease;
}

@media (max-width: 1200px) {
  .teammate {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .teammate {
    flex-direction: column;
  }
}
</style>
