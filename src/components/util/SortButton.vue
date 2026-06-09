<template>
   <IconButton :icon="sortByDate?'mdi-sort-calendar-ascending':'mdi-sort-alphabetical-ascending'" size="med"/> 
</template>

<script setup>
   import IconButton from './IconButton.vue'

   const props = defineProps({ sortByDate: Boolean })
</script>