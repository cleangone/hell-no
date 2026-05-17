<template>
   <DeleteConfirm type="Email" :name="props.email.subject" @delete="deleteEmail()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useUserStore }  from '@/stores/userStore'
   import { useEmailStore } from '@/stores/emailStore'
   
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ emailThread: Object, email: Object })
   const emit = defineEmits([Emit.DONE])
   
   const userStore  = useUserStore()
   const emailStore = useEmailStore()
            
   const deleteEmail = () => {
      // remove this user from the email.visibleToUserIds
      const emails = []
      for (const email of props.emailThread.emails) {
         if (email.id == props.email.id) { 
            const updatedEmail = { ...email }
            updatedEmail.visibleToUserIds = email.visibleToUserIds.filter(userId => userId != userStore.userId)
            emails.push(updatedEmail)
         }
         else { emails.push(email) }
      }

      emailStore.updateEmails(props.emailThread.id, emails)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
