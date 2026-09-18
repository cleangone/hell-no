<template>
   <div v-if="showGroups" class="text-left">
      <div class="text-h5">
         Groups
         <TextButton @click="showAddDialog=true" text="Add Group"/>
      </div>

      <v-data-table :headers="headers" :items="groups">
         <template v-slot:item.members="{ item }">
            <a @click="showGroupUsers(item)">{{ getMembersDesc(item) }}</a>
         </template> 
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editGroup(item)"/>
            <DeleteButton @click="deleteGroup(item)" :disabled="disableDelete(item)"/>
         </template>
      </v-data-table>
   </div>
   <div v-else class="text-left">
      <AdminGroupUsers :groupId="selectedGroup.id" @done="showGroups=true"/>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddGroup :userId="userStore.userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditGroupCard :groupId="selectedGroup.id" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteGroup :group="selectedGroup" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useGroupStore } from '@/stores/groupStore'
   import AdminGroupUsers   from './AdminGroupUsers.vue'
   import AddGroup          from '@/components/group/AddGroup.vue'
   import EditGroupCard     from '@/components/group/EditGroupCard.vue'
   import DeleteGroup       from '@/components/group/DeleteGroup.vue'
   import EditButton        from '@/components/util/EditButton.vue'
   import DeleteButton      from '@/components/util/DeleteButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   
   const userStore   = useUserStore()
   const groupStore  = useGroupStore()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const showGroups = ref(true)
   const selectedGroup = ref({})
   
   const headers = [
      { title: 'Name',        value: 'name',  sortable: true },
      { title: 'Description', value: 'desc' },
      { title: 'Status',      value: 'state', sortable: true,  align: 'center' },
      { title: 'Members',     key: 'members', sortable: false, align: 'center'  },
      { title: '',            key: 'actions', sortable: false },
   ]

   const disableDelete = (group) => { return group.userIds.length > 1 } // userIds includes ownerId

   const groups = computed(() => groupStore.groups)

   const getMembersDesc = (group) => {
      const totalmembers = group.userIds.length + group.invitedIds.length
      const invitedDesc = group.invitedIds.length ? " (" + group.invitedIds.length + " invited)" : ""
      return totalmembers + invitedDesc
   }

   const editGroup = (group) => {
      selectedGroup.value = group
      showEditDialog.value = true
   }

   const deleteGroup = (group) => {
      selectedGroup.value = group
      showDeleteDialog.value = true
   }

   const showGroupUsers = (group) => {
      selectedGroup.value = group
      showGroups.value = false
   }
</script>

<style>
</style>
