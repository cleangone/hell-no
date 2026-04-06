<template>
   <v-card>
      <v-row>
         <v-col class="flex-grow-1 flex-shrink-0">
            <v-tabs v-model="tab" color="primary" class="text-h6">
               <v-tab :value="tabs.items">{{ tabs.items }}</v-tab>
               <v-tab :value="tabs.galleries">{{ tabs.galleries }}</v-tab>
            </v-tabs>
         </v-col>
         <v-col class="flex-grow-0 flex-shrink-0 select-min">
            <v-select v-model="selectedUserId" label="User" :items="userOptions" clearable/>
         </v-col>   
      </v-row>
      <v-window v-model="tab" class="mt-n7">
         <v-window-item :value="tabs.items"><AdminItems :userId="selectedUserId"/></v-window-item>
         <v-window-item :value="tabs.galleries"><AdminGalleries :userId="selectedUserId"/></v-window-item>
      </v-window>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { useViewStore } from '@/stores/viewStore'
   import AdminItems     from '@/components/admin/AdminItems.vue'
   import AdminGalleries from '@/components/admin/AdminGalleries.vue'
   const userStore = useUserStore()
   const userMgr   = useUserMgr()   
   const viewStore = useViewStore()
   
   const tabs = { items: "Items", galleries: "Galleries" }
   const tab = ref(tabs.items)
   
   const userOptions = computed(() => {
      const options = []
      for (const user of userStore.users) { 
        options.push({ title: user.username + "(" + userMgr.getFullName(user) + ")", value: user.id })
      }

      options.sort(function(a, b) { return a.title.localeCompare(b.title) })    
      return options
   })

   const selectedUserId = computed({ 
      get() { return viewStore.adminSelectedUserId },
      set(id) {  viewStore.setAdminSelectedUserId(id) }
   }) 
</script>

<style>
.select-min {
  min-width: 35%;
}
</style>
