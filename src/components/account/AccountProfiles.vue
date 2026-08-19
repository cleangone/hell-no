<template>
   <div class="text-left">
      <div class="text-h5">
         My Profiles
         <TextButton @click="showAddDialog=true" text="Add Profile"/>
      </div>
      <v-data-table :headers="headers" :items="displayProfiles">
         <template v-slot:header.actions="{ }">
            <ToolTip iconClass="ml-n2"><v-icon icon="mdi-account-arrow-right"/> Swap to Profile</ToolTip> 
         </template>
         <template v-slot:item.actions="{ item }">
            <IconButton icon="mdi-account-arrow-right" @click="swapUser(item.id)" 
               :disabled="item.id==userStore.userId" size="med" class="admin-link"/>
            <DeleteButton @click="deleteProfile(item)" :disabled="profileActive(item)" class="admin-link"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddProfileUser :userId="userStore.userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteUser :user="selectedProfile" userType="Profile" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }       from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import AddProfileUser from '@/components/user/AddProfileUser.vue'
   import DeleteUser     from '@/components/user/DeleteUser.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import IconButton     from '@/components/util/IconButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import ToolTip        from '@/components/util/ToolTip.vue'
   import { Route } from '@/utils/constants'
   
   const router       = useRouter()
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const itemStore    = useItemStore()   
   const galleryStore = useGalleryStore()
   const showAddDialog    = ref(false)
   const showDeleteDialog = ref(false)
   const selectedProfile = ref({})
   
   const headers = [
      { title: 'Username',  value: 'username',     sortable: true },
      { title: '',          key:   'image',        align:'center'},
      { title: 'Galleries', value: 'galleryCount', align:'center' },
      { title: 'Items',     value: 'itemCount',    align:'center' },
      { title: '',          key:   "actions", sortable: false },
   ]

   const displayProfiles = computed(() => { 
      const profiles = []
      for (const profile of userMgr.myProfiles) {
         const displayProfile = { ...profile }

         const items = itemStore.getUserItems(profile.id)
         if (items.length) { displayProfile.itemCount = items.length }

         const galleries = galleryStore.getUserGalleries(profile.id)
         if (galleries.length) { displayProfile.galleryCount = galleries.length }

         profiles.push(displayProfile)
      }
      return profiles
   })

   const profileActive = (displayProfile) => { return displayProfile.galleryCount > 0 || displayProfile.itemCount > 0 }
   
   const swapUser = (profileId) => {
      userStore.userId = profileId
      router.push(Route.HOME.url)
   }

   const deleteProfile = (profile) => {
      selectedProfile.value = profile
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
