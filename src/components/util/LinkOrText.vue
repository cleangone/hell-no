<template>
   <span v-if="routesEqual">{{ text }}</span>
   <RouterLink v-else :to="url">{{ text }}</RouterLink>
</template>

<script setup>
   import { computed, ref } from 'vue'
   
   const props = defineProps({ currentRoute:Object, targetRoute:Object, targetId:String, url:String, text:String })

   const routesEqual = computed(() => { 
      return (props.currentRoute.name == props.targetRoute.name &&
              (!props.targetId || props.targetId == props.currentRoute.params.id)) 
   })

   const url  = computed(() => props.url  ? props.url  : props.targetRoute.url)
   const text = computed(() => props.text ? props.text : props.targetRoute.display)
</script>
