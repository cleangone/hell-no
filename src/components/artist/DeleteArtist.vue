<template>
   <DeleteConfirm type="Artist" :name="props.artist.fullName" @delete="deleteArtist()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useArtistStore } from '@/stores/artistStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({artist: Object})
   const emit = defineEmits([Emit.DONE])
   const artistStore = useArtistStore()
            
   const deleteArtist = () => {
      artistStore.deleteArtist(props.artist.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
