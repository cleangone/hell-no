<template>
   <div class="text-left">
      <div class="text-h5">Users</div>
      <v-data-table :headers="headers" :items="displayUsers" :custom-key-sort="customKeySort" 
            items-per-page="50" density="compact">
         <template v-slot:header.actions="{ }">
            <div class="d-flex justify-center align-center">
               <ToolTip iconClass="ml-n2"><v-icon icon="mdi-account-arrow-right"/> Swap to User</ToolTip> 
               &nbsp; &nbsp; &nbsp;
            </div>
         </template>
         <template v-slot:item.username="{ item }">
            <a @click="viewUser(item)" class="pointer">{{ item.username }}</a>
         </template>
         <template v-slot:item.items="{ item }">
            {{ item.items ? item.items : "" }}
         </template>
         <template v-slot:item.dateVisited="{ item }">{{ defaultDisplayDate(item.dateVisited) }}</template>
         <template v-slot:item.dateCreated="{ item }">{{ defaultDisplayDate(item.dateCreated) }}</template>
         <template v-slot:item.actions="{ item }">
            <IconButton icon="mdi-account-arrow-right" @click="swapUser(item.id)" 
               :disabled="item.id==userStore.userId" size="med" class="admin-link"/>
            <DeleteButton @click="deleteUser(item)" :disabled="disableDelete(item)" class="admin-link"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showViewDialog" width="auto">
      <ViewUser :user="selectedUser" @done="showViewDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteUser :user="selectedUser" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }     from 'vue-router'
   import { useUserStore }  from '@/stores/userStore'
   import { useUserMgr }    from '@/stores/userMgr'
   import { useItemStore }  from '@/stores/itemStore'
   import { useAdminStore } from '@/stores/adminStore'
   import DeleteUser   from '@/components/user/DeleteUser.vue'
   import ViewUser     from '@/components/user/ViewUser.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import ToolTip      from '@/components/util/ToolTip.vue'
   import { defaultDisplayDate } from '@/utils/dateUtils'
   import { Route } from '@/utils/constants'
   
   const router = useRouter()
   const userStore  = useUserStore()
   const userMgr    = useUserMgr()
   const itemStore  = useItemStore()
   const adminStore = useAdminStore()
   const showViewDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedUser = ref({})
   
   const headers = [
      { title: 'Username', key: 'username',   value: 'username' },
      { title: 'Name',     key: 'fullName',   value: 'fullName' },
      { title: 'Email',    key: 'email',      value: 'email' },
      { title: 'Items',    key: 'items',      value: 'items',       align: 'center' },
      { title: 'Visited',  key:'dateVisited', value: 'dateVisited', align: 'center' },
      { title: 'Created',  key:'dateCreated', value: 'dateCreated', align: 'center' },
      { title: 'Admin',    key: 'admin',      value: 'admin' },
      { title: '',         key: "actions" },
   ]

   const customKeySort = {
      email:       (a, b) => { return a.localeCompare(b) }, 
      username:    (a, b) => { return a.localeCompare(b) }, 
      fullName:   (a, b) => { return a.localeCompare(b) }, 
      items:       (a, b) => { return b - a }, 
      dateVisited: (a, b) => { return b - a }, 
      dateCreated: (a, b) => { return b - a }, 
      admin:       (a, b) => { return a.localeCompare(b) }, 
   } 

   const displayUsers = computed(() => {
      const users = []       
      for (const user of userStore.users) {
         const items = itemStore.getUserItems(user.id)
         users.push({ 
            ...user, 
            fullName: userMgr.getFullName(user),
            items: items.length ?? 0,
            admin: adminIds.value.includes(user.id) ? "Admin" : ""
         })
      }
      return users.toSorted(function(a, b) {return b.items - a.items})       
   })

   const adminIds = computed(() => adminStore.adminIds)
   
   const swapUser = (userId) => {
      userStore.userId = userId
      router.push(Route.ACCOUNT.url)
   }

   const disableDelete = (user) => { return user.id == userStore.userId || adminIds.value.includes(user.id) }

   const viewUser = (user) => {
      selectedUser.value = user
      showViewDialog.value = true
   }
   
   const deleteUser = (user) => {
      selectedUser.value = user
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
