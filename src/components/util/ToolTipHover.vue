<template>
  <v-tooltip :text="text" :location="location">
    <template v-slot:activator="{ props: activatorProps }">
      <slot :props="activatorProps"/>
    </template>
  </v-tooltip>
</template>

<script setup>
   const props = defineProps({
      text:     { type: String, required: true },
      location: { type: String, default: 'end' }
   })
</script>

<style>
</style>