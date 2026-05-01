<template>
   <v-card class="mt-2">
      <v-tabs v-model="tab" bg-color="primary">
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.items">Items</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.galleries">Galleries</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.profiles">Profiles</v-tab>
         <!-- <v-tab v-if="viewMgr.isDeskTop && !viewMgr.solo" :value="tabs.group">Groups</v-tab> -->
         <v-tab v-if="!viewMgr.solo"     :value="tabs.invites">Invites</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.wall">Wall</v-tab>
         <v-tab v-if="viewMgr.isDeskTop" :value="tabs.artists">Artists</v-tab>
         <v-tab v-if="viewMgr.isDeskTop"     :value="tabs.account"  class="align-self-center ml-auto" style="float:right">Account</v-tab>
         <v-tab v-else-if="viewMgr.isMobile" :value="tabs.account">Account</v-tab>
         <v-btn v-if="viewMgr.isMobile" @click="logout()" size="small" 
            class="text-blue align-self-center ml-auto mr-3" style="float:right">Logout</v-btn>
      </v-tabs>

      <v-card-text>
         <v-window v-model="tab">
            <v-window-item :value="tabs.items">     <AccountItems/>     </v-window-item>
            <v-window-item :value="tabs.galleries"> <AccountGalleries/> </v-window-item>
            <v-window-item :value="tabs.profiles">  <AccountProfiles/>  </v-window-item>
            <v-window-item :value="tabs.groups">    <AccountGroups/>    </v-window-item>
            <v-window-item :value="tabs.invites">   <AccountInvites/>   </v-window-item>
            <v-window-item :value="tabs.wall">      <AccountWall/>      </v-window-item>
            <v-window-item :value="tabs.artists">   <AccountArtists/>   </v-window-item>
            <v-window-item :value="tabs.account">   <Account/>          </v-window-item>
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
   import Account          from '@/components/account/Account.vue'
   import AccountArtists   from '@/components/account/AccountArtists.vue'
   import AccountGalleries from '@/components/account/AccountGalleries.vue'
   import AccountGroups    from '@/components/account/AccountGroups.vue'
   import AccountInvites   from '@/components/account/AccountInvites.vue'
   import AccountItems     from '@/components/account/AccountItems.vue'
   import AccountProfiles  from '@/components/account/AccountProfiles.vue'
   import AccountWall      from '@/components/account/AccountWall.vue'
   import { Route } from '@/utils/constants'
   
   const router = useRouter()
   const viewMgr = useViewMgr()
   const wasMobile = ref()
   const tabs = { 
       account: "account", artists: "artists", galleries: "galleries",  groups: "groups", invites: "invites",
       items: "items", profiles: "profiles", wall: "wall"
   }
   const tab = ref(tabs.item)
   const lastLargeScreenTab = ref(null)
   
   useSeoMeta({ title: "Hell-No My Account" })
   onMounted(() => {
      wasMobile.value = viewMgr.isMobile
      window.addEventListener('resize', onWWindowResize)
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
      router.push(Route.HOME.url)
   }
</script>

<style>
</style>
