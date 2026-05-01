<template>
    <div>
      <span v-if="siteInviteNotification">
         {{ siteInviteNotification.name }}: <RouterLink :to="siteInviteNotification.link">{{ siteInviteNotification.text }}</RouterLink> 
      </span>
      <a v-else-if="groupInviteNotification" @click="showAcceptGroupInviteDialog=true" class="hand"> {{ groupInviteNotification.text }}</a>
   </div>
   <v-dialog v-model="showAcceptGroupInviteDialog" width="auto">
      <AcceptGroupInvite :invite="groupInviteNotification.invite" @done="showAcceptGroupInviteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import AcceptGroupInvite from '@/components/invite/AcceptGroupInvite.vue'
   import { InviteType, TodoType, Route } from '@/utils/constants'
   
   const props = defineProps({ notification: Object })
   const showAcceptGroupInviteDialog = ref(false)

   const siteInviteNotification = computed(() => {
      const invite = props.notification.type == TodoType.INVITE && props.notification.invite.type == InviteType.SITE ? 
         props.notification.invite : null
      return invite ? 
         { name: invite.toFirstName, text: "Accept invitation and register", link: Route.REGISTER.url + invite.registerId } : null
   })

   const groupInviteNotification = computed(() => {
      const invite = props.notification.type == TodoType.INVITE && props.notification.invite.type == InviteType.GROUP ? 
         props.notification.invite : null
      return invite ? 
         { invite: invite, text: invite.groupName + " group invitation from " + invite.fromUserFullName } : null
   })
   
</script>

<style>
.hand {
   cursor: pointer;
}
</style>
