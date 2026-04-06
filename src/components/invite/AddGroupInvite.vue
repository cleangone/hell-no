<template>
   <v-card :title="'Invite User to Join ' + titleName" class="edit-dialog">
      <v-form v-model="dataValid"> 
         <v-container>
            <v-select v-if="!props.group" v-model="selectedGroupId" label="Group" :items="groupOptions" :rules="requiredRule" clearable density="compact"/>
            <hr v-if="!props.group" class="mb-5">
            <v-select v-if="!email && usersToInvite.length" v-model="selectedUserId" label="User" :items="usersToInvite" :rules="requiredRule" clearable density="compact"/>
            <div v-if="showOr" class="mx-5 mb-5 subheading font-italic">Or</div>
            <v-text-field v-if="!selectedUserId" v-model="email" label="Email" :rules="emailRule" @click:control="error=''"/>
         </v-container>
      </v-form>
      <div class="text-red-accent-4 text-subtitle-2 mx-4">
         {{ error }} &nbsp;
      </div>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="invite()" :disabled="!dataValid">Invite</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useUserMgr }     from '@/stores/userMgr'
   import { useInviteStore } from '@/stores/inviteStore'
   import { useGroupStore }  from '@/stores/groupStore'
   import { useGroupMgr }    from '@/stores/groupMgr'
   import { emailRule, requiredRule } from '@/utils/utils'
   import { Emit, InviteState, InviteType } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   const emit = defineEmits([Emit.DONE])

   const userStore   = useUserStore()
   const userMgr     = useUserMgr()
   const inviteStore = useInviteStore()
   const groupStore  = useGroupStore()
   const groupMgr    = useGroupMgr()
   const email = ref("")
   const selectedGroupId = ref(null)
   const selectedUserId  = ref(null)
   const userIdToUserContact = ref(new Map())
   const dataValid = ref(true)
   const error = ref("")

   const titleName = computed(() => props.group ? props.group.name : "Group")
   const showOr = computed(() => usersToInvite.length && (!email.value || !email.value.length) && !selectedUserId.value) 
   const groupOptions = computed(() => groupMgr.myGroupOptions) // { title: group.name, value: group.id }
   
   const usersToInvite = computed(() => {
      const group = props.group ? props.group : groupMgr.groupIdToMyGroup.get(selectedGroupId.value)
      if (!group) { return [] }

      const contactsNotInGroup = [] // { title: contact.fullName, value: contact.id }
      for (const contact of userMgr.myUserContacts) {
         userIdToUserContact.value.set(contact.id, contact)
         if (!group.userIds.includes(contact.id)) { contactsNotInGroup.push({ title: contact.fullName, value: contact.id }) }
      }
      return contactsNotInGroup
   })
   
   const invite = () => {
      console.log("AddGroupInvite")
      let newError = null
      const group = props.group ? props.group : groupMgr.groupIdToMyGroup.get(selectedGroupId.value)
      const invitedUserContact = selectedUserId.value ?
         userIdToUserContact.value.get(selectedUserId.value) :
         userMgr.getUserContactByEmail(email.value)
      
      if (!invitedUserContact) { newError = "Email not a user" }
      else if (group.userIds.includes(invitedUserContact.id)) { newError = "Already a group member" }
      else if (group.invitedIds.includes(invitedUserContact.id)) { newError = "Already invited to group" }

      if (newError) {
         error.value = newError
         return
      }

      groupStore.inviteUserIds(group.id, [invitedUserContact.id])
      inviteStore.addInvite({ 
         type: InviteType.GROUP, 
         toEmail: invitedUserContact.email,  // backend sends invite email
         toFirstName: invitedUserContact.firstName, 
         toUserId: invitedUserContact.id, 
         state: InviteState.CREATED,
         fromUserId: userStore.userId,
         fromUserFullName: userStore.myFullName,
         groupId: group.id,
         groupName: group.name,
       })

      emit(Emit.DONE)
   }
</script>

<style>
</style>
