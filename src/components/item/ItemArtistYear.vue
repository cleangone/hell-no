<template>
   <div v-if="artist || year">
      <span v-if="artist">{{ artist }}</span>
      <span v-if="artist && year"> &bull; </span>
      <span v-if="year">{{ year }}</span>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ item: Object })
   const artist = computed(() => props.item.primaryArtist ? props.item.primaryArtist.fullName : null)
   const year   = computed(() => props.item.yearCreated   ? props.item.yearCreated : null)
</script>

