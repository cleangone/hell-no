<template>
   <br v-if="viewMgr.isDeskTop">
   <v-card>
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab :value="tabs.email">Emails</v-tab>
         <v-tab :value="tabs.chat">Chats</v-tab>
      </v-tabs>
      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.email"><Emails/></v-window-item>
            <v-window-item :value="tabs.chat"><Chats/></v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import Emails from '@/components/email/Emails.vue'
   import Chats  from '@/components/chat/Chats.vue'
   
   const viewMgr = useViewMgr()
   const tabs = { email: "email", chat: "chat" }
   const tab = ref(tabs.email)
</script>

<style>
</style>
