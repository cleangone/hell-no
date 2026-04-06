<template>
  <v-card :title="'Invite other group\'s users to ' + props.group.name" class="edit-dialog">
      <v-form> 
         <v-select v-model="otherGroup" label="Group" :items="otherGroupOptions" class="pa-3"/>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="invite()" :disabled="!otherGroupOption">Invite</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useGroupStore }  from '@/stores/groupStore'
   import { useInviteStore } from '@/stores/inviteStore'
   import { Emit, InviteState, InviteType } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   const emit = defineEmits([Emit.DONE])

   const userStore   = useUserStore()
   const groupStore  = useGroupStore()
   const inviteStore = useInviteStore()
   const otherGroupOption = ref(null)
   
   const otherGroupOptions = computed(() => { 
      const options = []
      for (const group of groupStore.myGroups) {
         if (group.id != props.group.id) { options.push({ title: group.name, value: group }) }
      }
      return options
   })

   const otherGroup = computed({ 
      get() { return otherGroupOption.value },
      set(option) { otherGroupOption.value = option }
   })

   const invite = () => {
      console.log("invite - group.userIds", props.group.userIds)
      console.log("invite - otherGroup.userIds", otherGroupOption.value.userIds)
        
      const userIdsToInvite = []
      for (const userId of otherGroupOption.value.userIds) {
         if (!props.group.userIds.includes(userId) && !props.group.invitedIds.includes(userId)) { 
            userIdsToInvite.push(userId)

            const otherGroupUser = userStore.getUser(userId) 
            inviteStore.addInvite({ 
               type: InviteType.GROUP, 
               toEmail: otherGroupUser.email,  // backend sends invite email
               toFirstName: otherGroupUser.firstName, 
               toUserId: otherGroupUser.id, 
               state: InviteState.CREATED,
               fromUserId: userStore.userId,
               fromUserFullName: userStore.myFullName,
               groupId: props.group.id,
               groupName: props.group.name,
            })
         }
      }

      if (userIdsToInvite.length) {
         groupStore.inviteUserIds(props.group.id, userIdsToInvite)
      }
      emit(Emit.DONE)
   }
</script>

<style>
</style>
