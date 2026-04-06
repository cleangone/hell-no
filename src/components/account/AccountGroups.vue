<template>
   <div v-if="showGroups" class="text-left">
      <div class="text-h5">
         Groups
         <TextButton @click="showAddGroupDialog=true" text="Add Group"/>
      </div>

      <v-data-table :headers="headers" :items="groups">
         <template v-slot:item.myState="{ item }">
            {{ item.myState }}
            <span v-if="item.myState == GroupUserState.INVITED">
               <TextButton @click="acceptInvite(item)" text="Accept"/>
               <TextButton @click="declineInvite(item)" text="Decline"/>
            </span>
         </template> 
         <template v-slot:item.members="{ item }">
            <a @click="showGroupUsers(item)">{{ getMembersDesc(item) }}</a>
         </template> 
         <template v-slot:item.actions="{ item }">
            <div v-if="userOwnsGroup(item)">
               <EditButton   @click="editGroup(item)"/>
               <DeleteButton @click="deleteGroup(item)"/>
            </div>
         </template>
      </v-data-table>
   </div>
   <div v-else class="text-left">
      <AccountGroupUsers :groupId="selectedGroup.id" @done="showGroups=true"/>
   </div>

   <v-dialog v-model="showAddGroupDialog" width="auto">
      <AddGroup :userId="userStore.userId" @done="showAddGroupDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditGroupDialog" width="auto">
      <EditGroup :group="selectedGroup" @done="showEditGroupDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteGroupDialog" width="auto">
      <DeleteGroup :group="selectedGroup" @done="showDeleteGroupDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useGroupStore }  from '@/stores/groupStore'
   import { useActionStore } from '@/stores/actionStore'
   import AccountGroupUsers from './AccountGroupUsers.vue'
   import AddGroup       from '@/components/group/AddGroup.vue'
   import EditGroup      from '@/components/group/EditGroup.vue'
   import DeleteGroup    from '@/components/group/DeleteGroup.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import { ActionType, GroupUserState } from '@/utils/constants'
   
   const userStore   = useUserStore()
   const groupStore  = useGroupStore()
   const actionStore = useActionStore()
   const showAddGroupDialog    = ref(false)
   const showEditGroupDialog   = ref(false)
   const showDeleteGroupDialog = ref(false)
   const showGroups = ref(true)
   const selectedGroup = ref({})
   
   const headers = [
      { title: 'Name',             value: 'name', sortable: true },
      { title: 'Description',      value: 'desc' },
      { title: 'Status',           value: 'state',   align: 'center' },
      { title: 'My Status',        value: 'myState', align: 'center' },
      { title: 'Members',     key: 'members',        align: 'center'  },
      { title: '',            key: "actions" },
   ]

   const userOwnsGroup = (group) => { return group.ownerId == userStore.userId }

   const groups = computed(() => { 
      const displayGroups = []
      for (const group of groupStore.getUserGroups(userStore.userId)) {
         const displayGroup = { ...group }
         if (userOwnsGroup(group)) { displayGroup.myState = GroupUserState.OWNER }
         else if (group.moderatorIds.includes(userStore.userId)) { displayGroup.myState = GroupUserState.MODERATOR }
         else if (group.userIds.includes(userStore.userId))      { displayGroup.myState = GroupUserState.MEMBER }
         else if (group.invitedIds.includes(userStore.userId))   { displayGroup.myState = GroupUserState.INVITED }
         displayGroups.push(displayGroup)
      }
      return displayGroups
   })

   const getMembersDesc = (group) => {
      const totalmembers = group.userIds.length + group.invitedIds.length
      const invitedDesc = group.invitedIds.length ? " (" + group.invitedIds.length + " invited)" : ""
      return totalmembers + invitedDesc
   }

   const editGroup = (group) => {
      selectedGroup.value = group
      showEditGroupDialog.value = true
   }

   const deleteGroup = (group) => {
      selectedGroup.value = group
      showDeleteGroupDialog.value = true
   }

   const showGroupUsers = (group) => {
      selectedGroup.value = group
      showGroups.value = false
   }

   // don't have permission to update group
   const acceptInvite  = (group) => { addAction(ActionType.ACCEPT_GROUP_INVITE,  group) }
   const declineInvite = (group) => { addAction(ActionType.DECLINE_GROUP_INVITE, group) }
   const addAction = (actionType, group) => { 
      actionStore.addAction({ actionType: actionType, groupId: group.id, userId: userStore.userId })
    }

</script>

<style>
</style>
