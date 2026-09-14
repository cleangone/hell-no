<template>
   <div class="text-left">
      <v-data-table :headers="headers" :items="groupUsers">
         <template v-slot:item.actions="{ item }">
            <EditButton v-if="canEditUser(item)" @click="editUser(item)"/>
            <IconButton v-if="canRemoveUser(item)" icon="mdi-account-remove" @click="removeUser(item)"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditGroupUser :groupUser="selectedGroupUser" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showRemoveDialog" max-width="500px">
      <RemoveGroupUser :groupUser="selectedGroupUser" @done="showRemoveDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useGroupStore } from '@/stores/groupStore'
   import EditGroupUser     from '@/components/group/EditGroupUser.vue'
   import RemoveGroupUser   from '@/components/group/RemoveGroupUser.vue'
   import EditButton        from '@/components/util/EditButton.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import { Emit, GroupUserState } from '@/utils/constants'
   
   const props = defineProps({ groupId: String })
   const emit  = defineEmits([Emit.DONE])

   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const showEditDialog    = ref(false)
   const showRemoveDialog  = ref(false)
   const selectedGroupUser = ref({})

   const headers = [
      { title: 'Username',   value: 'username',  sortable: true },
      { title: 'First Name', value: 'firstName', sortable: true },
      { title: 'Status',     value: 'state', align: 'center', sortable: true },
      { title: '', key: "actions", sortable: false },
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

   const canRemoveUser = (groupUser) => { 
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

   const canEditUser = (groupUser) => { 
      // owner can edit if not trying to edit self or invited user
      return (group.value.ownerId == userStore.userId &&
              groupUser.state != GroupUserState.OWNER && 
              groupUser.state != GroupUserState.INVITED)
   }
   
   const editUser = (groupUser) => {
      selectedGroupUser.value = groupUser
      showEditDialog.value = true
   }

   const removeUser = (groupUser) => {
      selectedGroupUser.value = groupUser
      showRemoveDialog.value = true
   }
</script>

<style>
</style>
