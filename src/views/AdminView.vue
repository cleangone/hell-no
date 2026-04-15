<template>
   <br>
   <v-card class="admin">
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab                          :value="tabs.users">Users</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.items">Content</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.walls">Walls</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.artists">Artists</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.feeds">Feeds</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.chats">Chats</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.actions">Actions</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.test">Message Test</v-tab>
      </v-tabs>
   
      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.users"><AdminUsers/></v-window-item>
            <v-window-item :value="tabs.content"><AdminContent/></v-window-item>
            <v-window-item :value="tabs.walls"><AdminWalls/></v-window-item>
            <v-window-item :value="tabs.artists"><AdminArtists/></v-window-item>
            <v-window-item :value="tabs.feeds"><AdminFeeds/></v-window-item>
            <v-window-item :value="tabs.chats"><AdminChats/></v-window-item>
            <v-window-item :value="tabs.actions"><AdminActions/></v-window-item>
            <v-window-item :value="tabs.test"><AdminTest/></v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
   
</template>

<script setup>
   import { ref } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import AdminUsers   from '@/components/admin/AdminUsers.vue'
   import AdminContent from '@/components/admin/AdminContent.vue'
   import AdminWalls   from '@/components/admin/AdminWalls.vue'
   import AdminArtists from '@/components/admin/AdminArtists.vue'
   import AdminFeeds   from '@/components/admin/AdminFeeds.vue'
   import AdminChats   from '@/components/admin/AdminChats.vue'
   import AdminActions from '@/components/admin/AdminActions.vue'
   import AdminTest    from '@/components/admin/AdminTest.vue'
   
   const viewMgr = useViewMgr()
   const tabs = { 
      users: "users", content: "content", walls: "walls", artists: "artists", feeds: "feeds", chats: "chats", actions: "actions", test: "test" 
   }
   const tab = ref(tabs.item)

   useSeoMeta({
      title: "Hell-No Admin"
   })
</script>

<style>
.admin {
   font-size: 20px;
   text-align: center;
   height: 100%;
}
</style>
