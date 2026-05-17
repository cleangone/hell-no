<template>
   <div class="text-left">
      <div class="horizontal-container">
         <div style="min-width:400px;">
            <div v-if="replyContext && toContact" class="d-flex align-center mb-2">
               To: <RouterLink :to="Route.USER.url + toContact.userId" class="ml-2">{{ toContact.username }}</RouterLink>
            </div>
            <v-select v-else v-model="toContact" label="To" :items="userContacts" clearable density="compact"/>
            <v-text-field v-model="subject" label="Subject" class=""/>
            <v-textarea   v-model="content" label="Content"/>
         </div>
         <div v-if="emailItem" class="ml-2 mt-2">
            <v-row>
               <ItemThumb :item="emailItem" :origin="ItemOrigin.EXTERNAL" class="pt-1"/>
               <IconButton @click="clearItem()" icon="mdi-close-circle" class="float-bottom"/>
            </v-row>
         </div>
      </div>
      <div>  
         <v-btn @click="sendEmail()" :disabled="!canSendEmail" color="primary" class="mr-4">send</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary">cancel</v-btn>
      </div>   
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useUserMgr }    from '@/stores/userMgr'
   import { useEmailStore } from '@/stores/emailStore'
   import { useItemStore }  from '@/stores/itemStore'
   import ItemThumb  from '@/components/item/thumb/ItemThumb.vue'
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit, ItemOrigin, Route } from '@/utils/constants'
   
   
   /* emailContext - all fields optional 
      toContact: { userId: , username, email }
      item: { id , name }
      reply: { thread, email }
   */
   const props = defineProps({ emailContext: Object })
   const emit = defineEmits([Emit.DONE])

   const userStore  = useUserStore()
   const userMgr    = useUserMgr()
   const emailStore = useEmailStore()
   const itemStore  = useItemStore()
   const toContact  = ref(null)
   const subject    = ref('')
   const content    = ref('')
   const emailItemId = ref(null)
   const replyContext = ref(null)
   
   onMounted(() => {
      if (props.emailContext.toContact) { toContact.value = props.emailContext.toContact }
      if (props.emailContext.item) {
         subject.value     = props.emailContext.item.name
         emailItemId.value = props.emailContext.item.id
      }

      if (props.emailContext.reply) { 
         replyContext.value = { ...props.emailContext.reply }
         console.log("reply", replyContext.value)
         toContact.value = getOtherContact(replyContext.value.email)
         subject.value   = (replyContext.value.email.subject.startsWith("Re:") ? "" : "Re: ") + replyContext.value.email.subject
      }
   })

   const canSendEmail = computed(() => toContact.value && subject.value?.length && content.value?.length)
   const myContact    = computed(() => getEmailContact(userStore.user))
   const emailItem    = computed(() => emailItemId.value ? itemStore.getItem(emailItemId.value) : null )
   const getOtherContact = (email) => { return email.fromContact.userId == myContact.value.userId  ? email.toContact : email.fromContact }
   const getEmailContact = (user) =>  { return { userId: user.id, username: user.username, email: user.email } }
   
   const userContacts = computed(() => {
      const contacts = [] // { title: "username (fullName)", value: emailContact }
      for (const contact of userMgr.myUserContacts) {
         contacts.push({ title: contact.username + " (" +  contact.fullName + ")", value: getEmailContact(contact) }) 
      }
      return contacts
   })

   const clearItem = () => { emailItemId.value = null }

   const sendEmail = () => {
      const email = { toContact: toContact.value, fromContact: myContact.value, subject: subject.value, content: content.value }
      if (emailItemId.value) { email.itemId = emailItemId.value }
      
      if (replyContext.value) { emailStore.addEmail(replyContext.value.thread.id, email) }
      else { emailStore.addEmailThread(email) }

      emit(Emit.DONE)
   }
</script>

<style>
</style>
