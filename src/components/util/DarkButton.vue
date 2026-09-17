<template>
   <IconButton :icon="isDark?'mdi-brightness-5':'mdi-brightness-3'" @click="toggleDark()"/> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useDark, useToggle } from '@vueuse/core'
   import IconButton from './IconButton.vue'

   const isDark = useDark()
   const toggleDark = useToggle(isDark)
 </script>
