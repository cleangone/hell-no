<template>
   <div v-if="props.user || props.date">
      <span v-if="props.user">
            <RouterLink :to="URL.USER + props.user.id">{{ props.user.name }}</RouterLink>
      </span>
      <span v-if="props.user && props.date"> &bull; </span>
      <span v-if="props.date">{{  displayDate(props.date) }}</span>
   </div>
</template>

<script setup>
   import { displayDate } from '@/utils/dateUtils'
   import { URL } from '@/utils/constants'
   
   const props = defineProps({ user: Object, date: Object })
</script>

