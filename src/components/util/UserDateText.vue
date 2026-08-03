<template>
   <div v-if="props.user || props.date">
      <span v-if="user">
         <RouterLink :to="Route.USER.url + props.user.id">{{ user.name }}</RouterLink>
      </span>
      <span v-if="user && props.date"> &bull; </span>
      <span v-if="props.date">{{  displayDate(props.date) }}</span>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { displayDate } from '@/utils/dateUtils'
   import { Route } from '@/utils/constants'
   import { useViewMgr } from '@/stores/viewMgr'
   
   const props = defineProps({ user: Object, date: Object })

   const viewMgr = useViewMgr()
   const user = computed(() => viewMgr.solo ? null : props.user)
</script>

