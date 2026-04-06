<template>
   <v-card :title="props.invite.groupName + ' group invitation'" class="edit-dialog">
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="accept()">Accept</v-btn>
         <v-btn color="primary" @click="archive()">Archive Notifiction</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { useUserStore }   from '@/stores/userStore'
   import { useInviteStore } from '@/stores/inviteStore'
   import { useActionStore } from '@/stores/actionStore'
   import { ActionType, Emit, InviteState } from '@/utils/constants'
   
   const props = defineProps({ invite: Object })
   const emit = defineEmits([ Emit.DONE ])
   
   const userStore   = useUserStore()
   const inviteStore = useInviteStore()
   const actionStore = useActionStore()
   
   const accept = () => {
      console.log("accept", props.invite)
      // cannot update group directly - accept via action
      actionStore.addAction( {
         actionType: ActionType.ACCEPT_GROUP_INVITE, 
         groupId: props.invite.groupId, 
         userId: userStore.userId
      })

      inviteStore.updateInvite({ id: props.invite.id, state: InviteState.ACCEPTED } )
      emit(Emit.DONE)
   }
   
   const archive = () => {
      inviteStore.updateInvite({ id: props.invite.id, state: InviteState.ARCHIVED } )
      emit(Emit.DONE)
   }
</script>

<style>
</style>
