<template>
   <v-tooltip interactive >
      <template v-slot:activator="{ props: activatorProps }">
         <div v-bind="activatorProps">
            <slot></slot>
         </div>
      </template>
      <div class="d-flex justify-center align-center"> 
         <slot name="tip"></slot>
      </div>
   </v-tooltip>
</template>

<script setup>
   import { computed, ref } from 'vue'
</script>

<style>
</style>