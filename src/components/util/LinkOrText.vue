<template>
   <span v-if="props.currentRoute == props.route">{{ props.text }}</span>
   <RouterLink v-else :to="props.url">{{ props.text }}</RouterLink>
</template>

<script setup>
   const props = defineProps({ currentRoute:String, route:String, url:String, text:String })
</script>
