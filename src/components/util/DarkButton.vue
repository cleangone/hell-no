<template>
   <IconButton v-if="!isBrowserDarkMode" :icon="isDark?'mdi-brightness-3':'mdi-brightness-5'" @click="toggleDark()"/> 
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useDark, useToggle } from '@vueuse/core'
   import IconButton from './IconButton.vue'

   const isBrowserDarkMode = ref(false)
   
   onMounted(() => {
      
      // not working
      isBrowserDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
   })

   const isDark = useDark()
   const toggleDark = useToggle(isDark)
 </script>
