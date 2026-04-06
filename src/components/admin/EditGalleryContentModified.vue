<template>
   <v-card :title="'Edit Gallery - ' + gallery.name" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-date-input label="Date Content Modified" v-model="dateContentModified" 
               prepend-icon="" prepend-inner-icon="$calendar" :rules="requiredRule" class="mx-3"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { Timestamp } from "firebase/firestore"
   import { VDateInput } from 'vuetify/labs/VDateInput'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const galleryStore = useGalleryStore()
   const dateContentModified = ref(null)
   const dataValid = ref(true)
   
   onMounted(() => {
      if (props.gallery.dateContentModified) { dateContentModified.value = props.gallery.dateContentModified.toDate() }
   })

   const save = () => {
      const dbDateContentModified = Timestamp.fromDate(dateContentModified.value)
      galleryStore.updateGallery({ id: props.gallery.id, dateContentModified: dbDateContentModified })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
