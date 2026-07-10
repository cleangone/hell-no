<template>
   <div v-if="primaryArtist || year">
      <RouterLink v-if="primaryArtist" :to="Route.ARTIST.url + primaryArtist.id">{{ artistName(primaryArtist) }}</RouterLink>
      <span v-if="primaryArtist && year"> &bull; </span>
      <span v-if="year">{{ year }}</span>
   </div>
   <div v-if="otherArtist">
      <RouterLink :to="Route.ARTIST.url + otherArtist.id">{{ artistName(otherArtist) }}</RouterLink>
      <template v-if="otherArtists.length>1">...</template> <!-- template does not add white space -->
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({
      item: Object,
      showArtist:  { type: Boolean, default: true },
      showYear:    { type: Boolean, default: true },
      isXsSmThumb: { type: Boolean },
   })

   const primaryArtist = computed(() => props.showArtist && props.item.primaryArtist ? props.item.primaryArtist : null)
   const year          = computed(() => props.showYear   && props.item.yearCreated   ? props.item.yearCreated : null)
   const otherArtist   = computed(() => otherArtists.value.length ? otherArtists.value[0] : null)
   const otherArtists  = computed(() => 
      props.showArtist && !props.isXsSmThumb && props.item.otherArtists ? props.item.otherArtists : [])
   
   const artistName = (artist) => { return props.isXsSmThumb && artist.shortName ? artist.shortName : artist.fullName }
</script>

