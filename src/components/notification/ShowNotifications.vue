<template>
   <div class="notification text-left pa-3">
      <ul v-if="props.notifications.length > 1" >
         <li v-for="notification in props.notifications" :key="notification.id">
            <Notification :notification="notification"/>
         </li>
      </ul>
      <div v-else-if="notification" class="pl-2">
         <Notification :notification="notification"/>
      </div>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import Notification from '@/components/notification/Notification.vue'
   
   const props = defineProps({ notifications: Array })
   const notification = computed(() => props.notifications.length ? props.notifications[0] : null)
</script>

<style>
.notification {
   border: 2px solid lightgrey; 
   width: 100%;
}
</style>
