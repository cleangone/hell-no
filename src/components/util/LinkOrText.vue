<template>
   <span v-if="routesEqual">{{ props.text }}</span>
   <RouterLink v-else :to="props.url">{{ props.text }}</RouterLink>
</template>

<script setup>
   import { computed, ref } from 'vue'
   
   const props = defineProps({ 
      currentRoute:Object, targetRoute:String, targetId:String, url:String, text:String })

   const routesEqual = computed(() => { 
      return (props.currentRoute.name == props.targetRoute &&
              (!props.targetId || props.targetId == props.currentRoute.params.id)) 
   })
</script>
