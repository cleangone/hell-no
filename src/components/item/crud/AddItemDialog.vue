<template>
   <v-card title="Add Item" class="add-item-dialog">
      <AddItem :gallery="gallery" :userId="userId" @done="$emit(Emit.DONE)"/> 
   </v-card>
</template>

<script setup>
   import AddItem from './AddItem.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object, userId: String })
   const emit  = defineEmits([ Emit.DONE ])
</script>

<style>
.add-item-dialog {
   min-width: 450px;
   min-height:500px;
}
</style>
