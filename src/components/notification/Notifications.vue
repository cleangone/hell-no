<template>
   <div class="text-left">
      <div class="text-h6">
         Notifications 
         <TextButton v-if="showRead" @click="showRead=!showRead" text="Hide Read"/>
         <TextButton v-else @click="showRead=!showRead" text="Show Read"/>
      </div>
      <div>
         <v-card v-for="notification in notifications" class="bg-blue-lighten-5 mb-2">
            <div class="d-flex align-center justify-space-between w-100 px-2">
               <span class="py-1">
                  <span class="mr-2">{{ getDate(notification) }}</span>
                  <span v-if="notification.url" @click="toUrl(notification)" class="hand admin-link">{{  notification.text }}</span>
                  <span v-else>{{  notification.text }}</span>
               </span>
               <IconButton v-if="isUnread(notification)" @click="setStatus(notification)" icon="mdi-close-thick" xs color="blue-darken-2"/>
            </div>
         </v-card>
      </div>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }     from 'vue-router'
   import { useUserStore }  from '@/stores/userStore'
   import { useNotificationStore } from '@/stores/notificationStore'
   import { useItemStore }  from '@/stores/itemStore'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import ItemThumb   from '@/components/item/thumb/ItemThumb.vue'
   import TextButton  from '@/components/util/TextButton.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import { dateMmDd } from '@/utils/dateUtils'
   import { NotificationStatus } from '@/utils/constants'
   
   const router     = useRouter()
   const userStore  = useUserStore()
   const notificationStore = useNotificationStore()
   const itemStore  = useItemStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const showRead   = ref(false)
   
   const notifications = computed(() => showRead.value ? notificationStore.myNotifications : notificationStore.myUnreadNotifications)

   const toUrl = (notification) => { 
      if (isUnread(notification)) { setStatusRead(notification) }
      router.push(notification.url) 
   } 

   const getDate   = (notification) => { return dateMmDd(notification.dateCreated.toDate()) }
   const isUnread  = (notification) => { return notification.status == NotificationStatus.UNREAD } 
   const setStatus = (notification) => { notificationStore.setStatusRead(notification.id) } 
</script>

<style>
</style>
