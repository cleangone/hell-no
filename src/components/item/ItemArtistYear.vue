<template>
   <div v-if="artist || year">
      <RouterLink v-if="artist" :to="URL.ARTIST + artist.id">{{ artist.fullName }}</RouterLink>
      <span v-if="artist && year"> &bull; </span>
      <span v-if="year">{{ year }}</span>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { URL } from '@/utils/constants'
   
   const props = defineProps({ item: Object })
   const artist = computed(() => props.item.primaryArtist ? props.item.primaryArtist : null)
   const year   = computed(() => props.item.yearCreated   ? props.item.yearCreated : null)
</script>

