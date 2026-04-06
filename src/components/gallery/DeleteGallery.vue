<template>
   <DeleteConfirm type="Gallery" :name="props.gallery.name" @delete="deleteGallery()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useGalleryMgr } from '@/stores/galleryMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({gallery: Object})
   const emit = defineEmits([Emit.DONE])
   const galleryMgr = useGalleryMgr()
   
   const deleteGallery = () => {
      galleryMgr.deleteGallery(props.gallery)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
