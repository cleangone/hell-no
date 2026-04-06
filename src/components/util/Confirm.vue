<template>
   <v-card :title="props.title">
      <div class="text-body-1 mt-2 mx-6">{{ props.prompt }}</div>
         
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="$emit(Emit.CONFIRM)">{{ props.confirmAction }}</v-btn>
         <v-btn color="primary" @click="$emit(Emit.CANCEL)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { Emit } from '@/utils/constants'
   const props = defineProps(['title', 'prompt', 'confirmAction'])
   const emit = defineEmits([Emit.CONFIRM, Emit.CANCEL])
</script>
