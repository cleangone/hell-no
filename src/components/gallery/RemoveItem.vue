<template>
   <v-card title="Remove from Gallery">
      <div class="text-body-1 mt-2 mx-6">Are you sure you want to remove {{ props.item.name }} from gallery {{ props.gallery.name }}?</div>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="removeItem()">Remove</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGalleryMgr } from '@/stores/galleryMgr'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item: Object, gallery: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const galleryMgr = useGalleryMgr()
   
   const removeItem = () => {
      // backend handles updating item
      galleryMgr.removeItemId(props.gallery.id, props.item.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
