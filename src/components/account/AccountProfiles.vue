<template>
   <div class="text-left">
      <div class="text-h5">
         My Profiles
         <TextButton @click="showAddDialog=true" text="Add Profile"/>
      </div>
      <v-data-table :headers="headers" :items="profiles">
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editProfile(item)"/>
            <DeleteButton @click="deleteProfile(item)" :disabled="item.items > 0"/>
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
   import { useItemMgr }      from '@/stores/itemMgr'
   import AddProfile     from '@/components/profile/AddProfile.vue'
   import EditProfile    from '@/components/profile/EditProfile.vue'
   import DeleteProfile  from '@/components/profile/DeleteProfile.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   
   const userStore    = useUserStore()
   const profileStore = useProfileStore()
   const itemMgr      = useItemMgr()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedProfile = ref({})
   
   const headers = [
      { title: 'Name',   value: 'name',   sortable: true },
      { title: 'Items',  value: 'items',  align:'center' },
      { title: '',       key: "actions" },
   ]

   const profiles = computed(() => { 
      const displayProfiles = []
      for (const profile of profileStore.myProfiles) {
         const displayProfile = { ...profile }
         displayProfile.items = 0
         displayProfiles.push(displayProfile)
      }
      return displayProfiles
   })

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
