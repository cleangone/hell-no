<template>
   <br v-if="viewMgr.isDeskTop">
   <v-card>
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab :value="TABS.email">Emails</v-tab>
         <v-tab :value="TABS.chat">Chats</v-tab>
         <v-tab :value="TABS.notification">Notifications</v-tab>
      </v-tabs>
      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="TABS.email"><Emails/></v-window-item>
            <v-window-item :value="TABS.chat"><Chats :state="State.PUBLIC"/></v-window-item>
            <v-window-item :value="TABS.notification"><Notifications/></v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useNotificationStore } from '@/stores/notificationStore'
   import { useViewMgr } from '@/stores/viewMgr'
   import Emails         from '@/components/email/Emails.vue'
   import Chats          from '@/components/chat/Chats.vue'
   import Notifications  from '@/components/notification/Notifications.vue'
   import { State }  from '@/utils/constants'

   const TABS = { email: "email", chat: "chat", notification: "notification" }
   
   const viewMgr = useViewMgr()
   const notificationStore = useNotificationStore()
   
   const tab = ref(TABS.email)

   onMounted(async() => {
      if (notificationStore.myUnreadNotifications.length) { tab.value = TABS.notification }
   })
</script>

<style>
</style>
