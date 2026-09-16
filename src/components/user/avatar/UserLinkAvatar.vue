<template>
   <Avatar :user="user" @click="router.push(userUrl)" :toolTip="user.username" class="mt-3 hand pa-1 bg-black"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useRouter } from 'vue-router'
   import Avatar        from './Avatar.vue'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ user: Object })

   const router  = useRouter()
   const userUrl = computed(() => props.user ? Route.USER.url + props.user.id : null)
</script>

<style>
</style>
