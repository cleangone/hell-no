<template>
   <div class="text-left">
      <div class="text-left text-h6">
         <a @click="$emit(Emit.DONE)">Groups</a> 
         > {{ group.name }}
         <TextButton @click="showInviteDialog=true" text="Invite User"/>
         <TextButton @click="showInviteOtherGroupDialog=true" text="Invite Other Group's Users"/>
      </div>

      <v-data-table :headers="headers" :items="groupUsers">
         <template v-slot:item.actions="{ item }">
            <EditButton   v-if="canEditGroupUser(item)"   @click="editGroupUser(item)"/>
            <DeleteButton v-if="canDeleteGroupUser(item)" @click="deleteGroupUser(item)"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showInviteDialog" width="auto">
      <AddGroupInvite :group="group" @done="showInviteDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showInviteOtherGroupDialog" width="auto">
      <InviteOtherGroup :group="group" @done="showInviteOtherGroupDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditGroupUser :groupUser="selectedGroupUser" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" max-width="500px">
      <DeleteGroupUser :groupUser="selectedGroupUser" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import { useUserStore }  from '@/stores/userStore'
   import InviteOtherGroup from '@/components/group/InviteOtherGroup.vue'
   import EditGroupUser    from '@/components/group/EditGroupUser.vue'
   import DeleteGroupUser  from '@/components/group/DeleteGroupUser.vue'
   import AddGroupInvite   from '@/components/invite/AddGroupInvite.vue'  
   import EditButton       from '@/components/util/EditButton.vue'
   import DeleteButton     from '@/components/util/DeleteButton.vue'
   import TextButton       from '@/components/util/TextButton.vue'
   import { Emit, GroupUserState } from '@/utils/constants'
   
   const props = defineProps(['groupId'])
   const emit = defineEmits([Emit.DONE]);
   const groupStore = useGroupStore()
   const userStore  = useUserStore()
   const showInviteDialog = ref(false)
   const showInviteOtherGroupDialog = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedGroupUser = ref({})

   const headers = [
      { title: 'Username',   value: 'username',  sortable: true },
      { title: 'First Name', value: 'firstName', sortable: true },
      { title: 'Status',     value: 'state', align: 'center', sortable: true },
      { title: '', key: "actions" },
   ]

   const group = computed(() => { return groupStore.getGroup(props.groupId) })

   const groupUsers = computed(() => { 
      const users = []
      for (const userId of group.value.userIds) {
         const groupUser = buildGroupUser(group.value.id, userId, GroupUserState.MEMBER)
         if ( userId == group.value.ownerId) { groupUser.state = GroupUserState.OWNER }
         else if ( group.value.moderatorIds.includes(userId)) { groupUser.state = GroupUserState.MODERATOR }
         
         if (groupUser.id) { users.push(groupUser) }
      }
      
      for (const userId of group.value.invitedIds) {
         const groupUser = buildGroupUser(group.value.id, userId, GroupUserState.INVITED)
         if (groupUser) { users.push(groupUser) }
      }
      
      return users
   })

   const buildGroupUser = (groupId, userId, state) => { 
      const user = userStore.userIdToUser.get(userId)
      return user ? 
         { id: user.id, groupId: groupId, username: user.username, firstName: user.firstName, state: state } : {}
   }

   const canDeleteGroupUser = (groupUser) => { 
      // owner can delete if not trying to delete self
      // mod can delete if not trying to delete the owner or a mod
      if (group.value.ownerId == userStore.userId) {
         return groupUser.state != GroupUserState.OWNER 
      }
      else if (group.value.moderatorIds.includes(userStore.userId)) { 
         return groupUser.state != GroupUserState.OWNER && groupUser.state != GroupUserState.MODERATOR
      }
      else { return false }
   }

   const canEditGroupUser = (groupUser) => { 
      // owner can edit if not trying to edit self or invited user
      return (group.value.ownerId == userStore.userId &&
              groupUser.state != GroupUserState.OWNER && 
              groupUser.state != GroupUserState.INVITED)
   }
   
   const editGroupUser = (groupUser) => {
      selectedGroupUser.value = groupUser
      showEditDialog.value = true
   }

   const deleteGroupUser = (groupUser) => {
      selectedGroupUser.value = groupUser
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
