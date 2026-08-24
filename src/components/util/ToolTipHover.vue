<template>
  <v-tooltip :text="text" :location="location">
    <template v-slot:activator="{ props: activatorProps }">
        <slot :props="{ ...activatorProps, ...$attrs }"/>
    </template>
  </v-tooltip>
</template>

<script setup>
   defineOptions({ inheritAttrs: false }) // don't apply parent class to <v-tooltip>

   const props = defineProps({
      text:     { type: String, required: true },
      location: { type: String, default: 'end' }
   })
</script>

<style>
</style>