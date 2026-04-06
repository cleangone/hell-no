<template>
   <v-card title="Edit Wall Item" class="edit-dialog">
      <draggable-resizable-container class="drag-container ma-3">
         <draggable-resizable-vue  v-for="(wallItem, index) in wallItems" :key="wallItem.id"
               v-model:x="unusedX" v-model:y="unusedY" v-model:w="wallItem.width" v-model:active="isActive[index]"
               :lock-aspect-ratio="true" :parent="true">
            <img :src="wallItem.thumbUrl" class="drag-image"/>
         </draggable-resizable-vue>
      </draggable-resizable-container>

      <v-form v-model="dataValid">
         <v-row>
            <v-col>
               <v-text-field v-model="currWallItem.title" label="Thumb Text" class="ma-3"></v-text-field>
               <v-text-field v-model="currWallItem.name"  label="Popup Text" :rules="requiredRule" class="ma-3"></v-text-field>
            </v-col>
            <v-col>
               <!-- <v-select v-if="wallRowOptions.length" v-model="wallRow" label="Wall Row" :items="wallRowOptions" clearable class="ma-3" /> -->
               <v-checkbox v-if="!isSiteWall" v-model="siteWall" label="Display on Site Wall" class="ms-3 tight-checkbox"></v-checkbox> 
            </v-col>
         </v-row>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { DraggableResizableContainer, DraggableResizableVue } from 'draggable-resizable-vue3'
   import { useWallStore } from '@/stores/wallStore'
   import { requiredRule } from '@/utils/utils'
   import { Defaults, Emit } from '@/utils/constants'  
   
   const props = defineProps({ wallItem: Object, wall: Object })
   const emit = defineEmits([Emit.DONE])

   const wallStore = useWallStore()
   const currWallItem = ref({}) 
   const wallItems = ref([])  // for drag/resize
   // const wallRow = ref(null)
   // const wallRowOptions = ref([])
   const siteWall = ref(false)
   const unusedX = ref(0)
   const unusedY = ref(0)
   const isActive = ref([])
   const dataValid = ref(true)
   
   onMounted(() => {
      currWallItem.value = { ...props.wallItem }
      if (wallStore.siteWallIncludesImage(currWallItem.value.imageId)) { siteWall.value = true }

      wallItems.value.push(currWallItem.value)  // only one wallItem - doing rezize to get width
      isActive.value.push(false)

      // if (currWallItem.value.wallRow) { wallRow.value = currWallItem.value.wallRow }
      // for (let i=0; i<props.wall.wallRows; i++) {
      //    wallRowOptions.value.push(i + 1)
      // }
   })

   const isSiteWall = computed(() => props.wall.id == Defaults.SITE_ID)
   
   const save = () => {
      const updatedWallItems = []
      for (const wallItem of props.wall.wallItems) { 
         const wallItemToUpdate = { ...wallItem }
         if (wallItemToUpdate.itemId == currWallItem.value.itemId) {
            wallItemToUpdate.name     = currWallItem.value.name
            wallItemToUpdate.title    = currWallItem.value.title ? currWallItem.value.title : ""
            wallItemToUpdate.width    = currWallItem.value.width
            // wallItemToUpdate.wallRow  = wallRow.value 
         
            if (!isSiteWall.value && siteWall.value && !wallStore.siteWallIncludesImage(wallItemToUpdate.imageId)) { 
               wallStore.addSiteWallItem(wallItemToUpdate) 
            }
            if (!isSiteWall.value && !siteWall.value && wallStore.siteWallIncludesImage(currWallItem.value.imageId)) { 
               // remove from site wall
            }
         
         }
         updatedWallItems.push(wallItemToUpdate)
      }

      wallStore.updateWall({ 
         id: props.wall.id, 
         wallItems: updatedWallItems 
      })  

      emit(Emit.DONE)
   }

</script>

<style>
.drag-container {
   width: 95%;
   min-height: 250px;
   border: 1px solid black; 
   position: relative;
}
.drag-image {
   width: 100%;
   height: 100%;
}
</style>
