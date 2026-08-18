<template>
   <v-card title="Edit Wall Item" class="edit-dialog">
      <v-form v-model="dataValid">  
         <v-col>
            <v-text-field v-model="currWallItem.title" label="Thumb Text" class="ma-3"/>
            <v-text-field v-model="currWallItem.name"  label="Popup Text" :rules="requiredRule" class="ma-3"/>
         </v-col>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useWallStore } from '@/stores/wallStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'  
   
   const props = defineProps({ wallItem: Object, wall: Object })
   const emit = defineEmits([Emit.DONE])

   const wallStore = useWallStore()
   const currWallItem = ref({}) 
   const dataValid = ref(true)
   
   onMounted(() => { currWallItem.value = { ...props.wallItem } })

   const save = () => {
      const updatedWallItems = []
      for (const wallItem of props.wall.wallItems) { 
         const wallItemToUpdate = { ...wallItem }
         if (wallItemToUpdate.itemId == currWallItem.value.itemId) {
            wallItemToUpdate.name  = currWallItem.value.name
            wallItemToUpdate.title = currWallItem.value.title ? currWallItem.value.title : ""
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
</style>
