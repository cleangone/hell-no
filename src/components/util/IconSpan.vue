<template>
   <span style="white-space:nowrap">
      <Icon v-for="icon in icons" :key="icon" :icon="icon" size="small"/>
   </span>
</template>

<script setup>
   import Icon from './Icon.vue'
   const props = defineProps({icons: Array})
</script>