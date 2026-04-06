<template>
   <v-card :title="'Edit Item - ' + item.name" class="edit-dialog">
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
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { requiredRule } from '@/utils/utils'
   import { timestampsEqual } from '@/utils/dateUtils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const dateContentModified = ref(null)
   const dataValid = ref(true)
   
   onMounted(() => {
      if (props.item.dateContentModified) { dateContentModified.value = props.item.dateContentModified.toDate() }
   })

   const save = () => {
      const dbDateContentModified = Timestamp.fromDate(dateContentModified.value)
      itemStore.updateItem({ id: props.item.id, dateContentModified: dbDateContentModified })
     
      // possibly move to backend, but hardly ever done
      for (const galleryId of props.item.galleryIds) { 
         const gallery = galleryStore.getGallery(galleryId)
         // console.log("Gallery " + gallery.name)
         const itemsContentModified = []
         for (const itemId of gallery.itemIds) {
            if (itemId == props.item.id) { 
               // console.log("Props item")
               itemsContentModified.push(dbDateContentModified) }
            else { 
               const item = itemStore.getItem(itemId)
               // console.log("Item " + item.name)
               if (item.dateContentModified) { itemsContentModified.push(item.dateContentModified) }
            }
         }
         
         itemsContentModified.sort(function(a, b) { return b - a }) 
         const galleryContentModified = itemsContentModified.length ? itemsContentModified[0] : null
         // console.log("galleryContentModified " + galleryContentModified.toDate())
         if (galleryContentModified && !timestampsEqual(galleryContentModified, gallery.dateContentModified)) {
            galleryStore.updateGallery({ id: galleryId, dateContentModified: galleryContentModified }) 
         }
      }

      emit(Emit.DONE)
   }
</script>

<style>
</style>
