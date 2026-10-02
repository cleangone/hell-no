<template>
   <div class="text-left">
      <div class="text-h6 justify-space-between">
         <span>        
            {{ showActive ? "Active Notifications" : "Notifications" }}
            <TextButton :text="showActive?'Show All':'Show Active'" @click="showActive=!showActive"/>
         </span>
         <TextButton v-if="!showActive && notifications.length" text="Delete Inactive" @click="deleteInactive()"/>
      </div>
      <div>
         <v-card v-for="notification in notifications" class="bg-blue-lighten-5 mb-2">
            <HorizontalDiv class="px-2">
               <div v-if="notification.itemId">
                  <ItemThumb :item="getItem(notification)" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL" emitPopup @popup="onPopup"/>
               </div>
               <div class="d-flex align-center justify-space-between w-100">
                  <span class="py-1">
                     <span class="mr-2">{{ getDate(notification) }}</span>
                     <span v-if="notification.url" @click="toUrl(notification)" class="hand admin-link">{{  notification.text }}</span>
                     <span v-else>{{  notification.text }}</span>
                  </span>
                  <IconButton v-if="isActive(notification)" @click="setInactive(notification)" icon="mdi-close-thick" xs color="blue-darken-2"/>
                  <DeleteButton v-else @click="deleteNotification(notification)" class="admin-link"/> 
               </div>
            </HorizontalDiv>
         </v-card>
      </div>
   </div>
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }    from 'vue-router'
   import { useNotificationStore } from '@/stores/notificationStore'
   import { useItemStore } from '@/stores/itemStore'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemPopup        from '@/components/item/ItemPopup.vue'
   import DeleteButton     from '@/components/util/DeleteButton.vue'
   import TextButton       from '@/components/util/TextButton.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import HorizontalDiv    from '@/components/util/HorizontalDiv.vue'
   import { dateMmDd } from '@/utils/dateUtils'
   import { ItemOrigin, NotificationStatus, ThumbSize } from '@/utils/constants'
   
   const router     = useRouter()
   const notificationStore = useNotificationStore()
   const itemStore  = useItemStore()
   const showActive = ref(true)
   const popupImage = ref(null)
   
   const notifications = computed(() => showActive.value ? notificationStore.myActiveNotifications : notificationStore.myNotifications)

   const toUrl = (notification) => { 
      if (isActive(notification)) { setInactive(notification) }
      router.push(notification.url) 
   } 

   const getDate  = (notification) => { return dateMmDd(notification.dateCreated.toDate()) }
   const isActive = (notification) => { return notification.status == NotificationStatus.ACTIVE } 
   const getItem  = (notification) => { return itemStore.getItem(notification.itemId) }
   
   const setInactive = (notification) => { notificationStore.setInactive(notification.id) } 
   
   const deleteNotification = (notification) => { notificationStore.deleteNotification(notification.id) }

   const deleteInactive = () => { 
      const inactiveIds = notificationStore.myNotifications
         .filter(notification => notification.status == NotificationStatus.INACTIVE)
         .map(notification => notification.id)
      notificationStore.deleteNotifications(inactiveIds) 
   }

   const onPopup = (popup) => { popupImage.value = popup }
</script>

<style>
</style>
