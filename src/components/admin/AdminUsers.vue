<template>
   <div class="text-left">
      <div class="text-h5">Users</div>
      <v-data-table :headers="headers" :items="displayUsers" :custom-key-sort="customKeySort" 
         items-per-page="25" density="compact">
         <template v-slot:item.dateCreated="{ item }">{{ defaultDisplayDate(item.dateCreated) }}</template>
         <template v-slot:item.items="{ item }">
            {{ item.items ? item.items : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteUser(item)" :disabled="disableDelete(item)"></DeleteButton>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteUser :user="selectedUser" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemStore }  from '@/stores/itemStore'
   import { useAdminStore } from '@/stores/adminStore'
   import DeleteUser   from '@/components/user/DeleteUser.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import { defaultDisplayDate } from '@/utils/dateUtils'
   import { NotificationOptions } from '@/utils/constants'
   
   const userStore  = useUserStore()
   const itemStore  = useItemStore()
   const adminStore = useAdminStore()
   const showDeleteDialog = ref(false)
   const selectedUser = ref({})
   
   const headers = [
      { title: 'Email',       key: 'email',      value: 'email' },
      { title: 'Username',    key: 'username',   value: 'username' },
      { title: 'Created',     key:'dateCreated', value: 'dateCreated', align: 'center' },
      { title: 'Last Name',                      value: 'lastName' },
      { title: 'First Name',  key: 'firstName',  value: 'firstName' },
      { title: 'Email Notify',key: 'emailNotify',value: 'emailNotify', align: 'center' },
      { title: 'Items',       key: 'items',      value: 'items',       align: 'center' },
      { title: 'Admin',       key: 'admin',      value: 'admin' },
      { title: '',            key: "actions" },
   ]

   const customKeySort = {
      email:       (a, b) => { return a.localeCompare(b) }, 
      username:    (a, b) => { return a.localeCompare(b) }, 
      firstName:   (a, b) => { return a.localeCompare(b) }, 
      dateCreated: (a, b) => { return b - a }, 
      emailNotify: (a, b) => { return a.localeCompare(b) }, 
      items:       (a, b) => { return b - a }, 
      admin:       (a, b) => { return a.localeCompare(b) }, 
   } 

   const displayUsers = computed(() => {
      const users = []       
      for (const user of userStore.users) {
         const items = itemStore.getUserItems(user.id)
         users.push({ 
            ...user, 
            items: items.length ? items.length : 0,
            emailNotify: !user.settings || user.settings.notifyViaEmail ==  NotificationOptions.NEVER ? 
               "" : user.settings.notifyViaEmail,
            admin: adminIds.value.includes(user.id) ? "Admin" : ""
         })
      }
      return users
   })

   const adminIds = computed(() => adminStore.adminIds)

   const disableDelete = (user) => { return user.id == userStore.userId || adminIds.value.includes(user.id) }

   const deleteUser = (user) => {
      selectedUser.value = user
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
