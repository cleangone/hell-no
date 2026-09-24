<template>
   <v-icon :icon="isExpanded?'mdi-chevron-down':'mdi-chevron-right'" :large="large" :class="iconClass"/>
</template>

<script setup>
   const props = defineProps({ isExpanded: Boolean, large: Boolean, iconClass: String })
</script>