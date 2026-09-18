<template>
   <br>
   <v-card class="admin">
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab                          :value="tabs.users">Users</v-tab>
         <template v-if="viewMgr.isDeskTop">
            <v-tab  :value="tabs.groups">Groups</v-tab>
            <v-tab  :value="tabs.items">Content</v-tab>
            <v-tab  :value="tabs.walls">Walls</v-tab>
            <v-tab  :value="tabs.artists">Artists</v-tab>
            <!-- <v-tab :value="tabs.feeds">Feeds</v-tab> -->
            <v-tab  :value="tabs.chats">Chats</v-tab>
            <v-tab  :value="tabs.actions">Actions</v-tab>
            <v-tab  :value="tabs.files">Files</v-tab>
            <v-tab  :value="tabs.test">Message Test</v-tab>
         </template>
      </v-tabs>
   
      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.users"><AdminUsers/></v-window-item>
            <v-window-item :value="tabs.groups"><AdminGroups/></v-window-item>
            <v-window-item :value="tabs.content"><AdminContent/></v-window-item>
            <v-window-item :value="tabs.walls"><AdminWalls/></v-window-item>
            <v-window-item :value="tabs.artists"><AdminArtists/></v-window-item>
            <v-window-item :value="tabs.feeds"><AdminFeeds/></v-window-item>
            <v-window-item :value="tabs.chats"><AdminChats/></v-window-item>
            <v-window-item :value="tabs.actions"><AdminActions/></v-window-item>
            <v-window-item :value="tabs.files"><AdminFiles/></v-window-item>
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
   import AdminGroups  from '@/components/admin/AdminGroups.vue'
   import AdminContent from '@/components/admin/AdminContent.vue'
   import AdminWalls   from '@/components/admin/AdminWalls.vue'
   import AdminArtists from '@/components/admin/AdminArtists.vue'
   import AdminFeeds   from '@/components/admin/AdminFeeds.vue'
   import AdminChats   from '@/components/admin/AdminChats.vue'
   import AdminFiles   from '@/components/admin/AdminFiles.vue'
   import AdminActions from '@/components/admin/AdminActions.vue'
   import AdminTest    from '@/components/admin/AdminTest.vue'
   
   const viewMgr = useViewMgr()
   const tabs = { 
      users: "users", groups: "groups", content: "content", walls: "walls", artists: "artists", 
      // feeds: "feeds", 
      chats: "chats", actions: "actions", files: "files", test: "test" 
   }
   const tab = ref(tabs.item)

   useSeoMeta({ title: "Hell-No Admin" })
</script>

<style>
.admin {
   font-size: 20px;
   text-align: center;
   height: 100%;
}
</style>
