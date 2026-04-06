<template>
   <v-card :title="'Delete ' + props.type">
      <div class="text-body-1 mt-2 mx-6">Are you sure you want to delete {{ props.name }}?</div>
         
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="$emit(Emit.DELETE)">Delete</v-btn>
         <v-btn color="primary" @click="$emit(Emit.CANCEL)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { Emit } from '@/utils/constants'
   const props = defineProps(['type', 'name'])
   const emit = defineEmits([Emit.DELETE, Emit.CANCEL])
</script>
