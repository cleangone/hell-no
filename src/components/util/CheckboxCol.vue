<template>
   <v-col>
      <div v-for="chkbox in chkboxCol" :key="chkbox.id" class="d-flex align-center tight-checkbox">
         <v-checkbox v-model="chkbox.selected" :label="chkbox.name" density="compact" hide-details class="py-0"/>
         <v-icon v-if="chkbox.isParent" :icon="icon(chkbox)" @click="toggleExpand(chkbox.id)" 
            size="small" class="menu-icon ml-1"/>                           
      </div>
   </v-col>           
</template>

<script setup>
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ chkboxCol: Object })
   const emit = defineEmits([Emit.TOGGLE])

   const icon = (chkbox) => { return chkbox.isExpanded ? "mdi-chevron-down-circle" : "mdi-chevron-right-circle" }
   const toggleExpand = (id) => { emit(Emit.TOGGLE, id) }
</script>

