<template>
   <div class="text-left">
      <div class="text-h5">
         My Profiles
         <TextButton @click="showAddDialog=true" text="Add Profile"/>
      </div>
      <v-data-table :headers="headers" :items="profiles">
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editProfile(item)"/>
            <DeleteButton @click="deleteProfile(item)" :disabled="profileUsed(item)"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddProfile :userId="userStore.userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditProfile :profile="selectedProfile" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteProfile :profile="selectedProfile" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useItemMgr }      from '@/stores/itemMgr'
   import AddProfile     from '@/components/profile/AddProfile.vue'
   import EditProfile    from '@/components/profile/EditProfile.vue'
   import DeleteProfile  from '@/components/profile/DeleteProfile.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   
   const userStore    = useUserStore()
   const profileStore = useProfileStore()
   const galleryMgr   = useGalleryMgr()
   const itemMgr      = useItemMgr()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedProfile = ref({})
   
   const headers = [
      { title: 'Username',  value: 'username',     sortable: true },
      { title: 'Galleries', value: 'galleryCount', align:'center' },
      { title: 'Items',     value: 'itemCount',    align:'center' },
      { title: '',          key: "actions" },
   ]

   const profiles = computed(() => { 
      const displayProfiles = []
      for (const profile of profileStore.myProfiles) {
         const displayProfile = { ...profile }
         const itemCount = itemMgr.getProfileCount(profile.id)
         if (itemCount) { displayProfile.itemCount = itemCount }

         const galleryCount = galleryMgr.getProfileCount(profile.id)
         if (galleryCount) { displayProfile.galleryCount = galleryCount }

         displayProfiles.push(displayProfile)
      }
      return displayProfiles
   })

   const profileUsed = (displayProfile) => { return displayProfile.galleryCount > 0 || displayProfile.itemCount > 0 }
   
   const editProfile = (profile) => {
      selectedProfile.value = profile
      showEditDialog.value = true
   }

   const deleteProfile = (profile) => {
      selectedProfile.value = profile
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
