<template>
   <RouterLink v-if="user" :to="userUrl" class="mt-3">
      <Avatar :user="user" :toolTip="user.username" class="pa-1 bg-black"/>
   </RouterLink>
</template>

<script setup>
   import { computed } from 'vue'
   import Avatar from './Avatar.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ user: Object })
   const userUrl = computed(() => props.user ? Route.USER.url + props.user.id : null)
</script>

<style>
</style>
