<template>
   <Confirm title="Elevate Artist" :prompt="prompt" confirmAction="Elevate" @confirm="elevateArtist()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useArtistStore } from '@/stores/artistStore'
   import Confirm from '@/components/util/Confirm.vue'
   import { Emit } from '@/utils/constants'
   import { ArtistVisibility } from '@/utils/constants'
   
   const props = defineProps({ artist: Object })
   const emit = defineEmits([Emit.DONE])
   
   const userStore = useUserStore()
   const artistStore = useArtistStore()
       
   const prompt = computed(() => "Elevate " + props.artist.fullName + " to Site visibility?")

   const elevateArtist = () => {
      artistStore.updateArtist({
         id: props.artist.id,  
         userId: userStore.userId,
         visibility: ArtistVisibility.SITE,
         action: "" 
      })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
