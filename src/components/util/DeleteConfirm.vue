<template>
   <v-card :title="title">
      <div class="text-body-1 mt-2 mx-6">{{ text }}</div>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="$emit(Emit.DELETE)">{{ action }}</v-btn>
         <v-btn color="primary" @click="$emit(Emit.CANCEL)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed } from 'vue'
   import { Emit } from '@/utils/constants'

   const props = defineProps({ type:String, name:String, action:{type:String, default:"Delete"} })
   const emit  = defineEmits([Emit.DELETE, Emit.CANCEL])

   const title = computed(() => props.action + " " + props.type)
   const text  = computed(() => "Are you sure you want to " + props.action.toLowerCase() + " " + props.name + "?")
</script>
