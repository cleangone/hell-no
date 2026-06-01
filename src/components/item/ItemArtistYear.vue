<template>
   <div v-if="primaryArtist || year">
      <RouterLink v-if="primaryArtist" :to="Route.ARTIST.url + primaryArtist.id">{{ primaryArtist.fullName }}</RouterLink>
      <span v-if="primaryArtist && year"> &bull; </span>
      <span v-if="year">{{ year }}</span>
   </div>
   <div v-for="artist in otherArtists" :key="artist.id">
      <RouterLink :to="Route.ARTIST.url + artist.id">{{ artist.fullName }}</RouterLink>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ item: Object })

   const primaryArtist = computed(() => props.item.primaryArtist ? props.item.primaryArtist : null)
   const otherArtists  = computed(() => props.item.otherArtists  ? props.item.otherArtists : [])
   const year          = computed(() => props.item.yearCreated   ? props.item.yearCreated : null)
</script>

