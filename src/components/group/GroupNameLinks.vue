<template>
   <span v-if="groups?.length">
      <span v-for="(group, index) in groups" :key="group.id">
         <span v-if="index">, </span>
         <RouterLink :to="Route.GROUP.url + group.id">{{ group.name }}</RouterLink>
      </span>
   </span>
</template>

<script setup>
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ groups: Object })
</script>

