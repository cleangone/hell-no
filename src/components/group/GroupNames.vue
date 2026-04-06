<template>
   <div v-if="groups?.length">
      via
      <span v-for="(group, index) in groups" :key="group.id">
         <span v-if="index">, </span>
         <RouterLink :to="URL.GROUP + group.id">{{ group.name }}</RouterLink>
      </span>
   </div>
</template>

<script setup>
   import { URL } from '@/utils/constants'
   
   const props = defineProps({ groups: Object })
</script>

