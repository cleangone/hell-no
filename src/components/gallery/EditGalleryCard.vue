<template>
   <v-card :title="title" >
   <!-- <v-card :title="title" class="fill-height"> -->
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </template>
      <div v-if="editGallery">
         <TextButton text="Edit Images" @click="editGallery=false" class="mx-3"/>
         <EditGallery :gallery="props.gallery" @done="$emit(Emit.DONE)"/>
      </div>
      <div v-else>
         <TextButton text="Edit Gallery" @click="editGallery=true" class="mx-3"/>
         <EditGalleryImages :galleryId="props.gallery.id"/>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import EditGallery       from './EditGallery.vue'
   import EditGalleryImages from './EditGalleryImages.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object, editImages: Boolean })
   const emit = defineEmits([ Emit.DONE ])

   const editGallery = ref(true)
   
   onMounted(() => {
      if (props.editImages) { editGallery.value = false}
   })
   
   const title = computed(() => editGallery.value ? "Edit Gallery" :  "Edit Gallery Images")
</script>

<style>

.edit-gallery {
  min-width: min(600px, 100%);
  /* min-width: 900px; */
  min-height: 600px;  
   
}
</style>
