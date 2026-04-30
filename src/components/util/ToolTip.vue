<template>
   <v-tooltip interactive >
      <template v-slot:activator="{ props: activatorProps }">
         <IconButton icon="mdi-information-outline" v-bind="activatorProps" :class="iconClass"/>
      </template>
      <div class="d-flex justify-center align-center"> 
         <slot>ToolTip Text</slot>
      </div>
   </v-tooltip>            
</template>

<script setup>
   import { computed, ref } from 'vue'
   import IconButton   from '@/components/util/IconButton.vue'
   
   const props = defineProps({ iconClass: String })
</script>

<style>
</style>