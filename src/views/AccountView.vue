<template>
   <v-card class="mt-2">
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.item">Items</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.gallery">Galleries</v-tab>
         <v-tab                          :value="tabs.profile">Profile</v-tab>
         <v-tab v-if="viewMgr.isDeskTop && !viewMgr.solo" :value="tabs.group">Groups</v-tab>
         <v-tab v-if="!viewMgr.solo"     :value="tabs.invite">Invites</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.wall">Wall</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.artist">Artists</v-tab>
         <v-btn v-if="viewMgr.isMobile" @click="logout()" size="small" 
            class="align-self-center ml-auto mr-3" style="float:right">Logout</v-btn>
      </v-tabs>

      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.item">     <AccountItems/>     </v-window-item>
            <v-window-item :value="tabs.gallery">  <AccountGalleries/></v-window-item>
            <v-window-item :value="tabs.profile">  <AccountProfile/>   </v-window-item>
            <v-window-item :value="tabs.group">    <AccountGroups/>    </v-window-item>
            <v-window-item :value="tabs.invite">   <AccountInvites/>   </v-window-item>
            <v-window-item :value="tabs.wall">     <AccountWall/>      </v-window-item>
            <v-window-item :value="tabs.artist">   <AccountArtists/>   </v-window-item>
         </v-window>
      </v-card-text>
  </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRouter } from 'vue-router'
   import { getAuth, signOut } from "firebase/auth"
   import { useViewMgr } from '@/stores/viewMgr'
   import AccountItems     from '@/components/account/AccountItems.vue'
   import AccountGalleries from '@/components/account/AccountGalleries.vue'
   import AccountProfile   from '@/components/account/AccountProfile.vue'
   import AccountGroups    from '@/components/account/AccountGroups.vue'
   import AccountInvites   from '@/components/account/AccountInvites.vue'
   import AccountWall      from '@/components/account/AccountWall.vue'
   import AccountArtists   from '@/components/account/AccountArtists.vue'
   import { URL } from '@/utils/constants'
   
   const router = useRouter()
   const viewMgr = useViewMgr()
   const wasMobile = ref()
   const tabs = { 
      item: "item", gallery: "gallery", profile: "profile", group: "group", invite: "invite", 
      wall: "wall", artist: "artist"
   }
   const tab = ref(tabs.item)
   const lastLargeScreenTab = ref(null)
   
   onMounted(() => {
      wasMobile.value = viewMgr.isMobile
      window.addEventListener('resize', onWWindowResize)
   })

   useSeoMeta({
      title: "Hell-No My Account"
   })
   
   const onWWindowResize = () => { 
      if (viewMgr.isDeskTop) { 
         if (wasMobile.value) {
            if (lastLargeScreenTab.value) { tab.value = lastLargeScreenTab.value }
         }
         else { lastLargeScreenTab.value = tab.value }
      }
      
      wasMobile.value = viewMgr.isMobile
   }

   const logout = () => { 
      signOut(getAuth()) 
      router.push(URL.HOME)
   }
</script>

<style>
</style>
