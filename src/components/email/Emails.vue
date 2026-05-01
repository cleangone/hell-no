<template>
   <div class="text-left">
      <div class="text-h6">
         Email Threads <TextButton v-if="showEmailThreads" @click="showEmailThreads=false" text="Send Email"/>
      </div>
      <!-- show email threads-->
      <div v-if="showEmailThreads">
         <div v-if="myEmailThreadsExist">
            <v-card v-for="thread in myEmailThreads" class="bg-blue-lighten-5 mb-2">
               <v-card-item class="pa-0">
                  <!-- title -->
                  <div @click="toggleEmailThread(thread)" class="px-2 py-0 pointer"> 
                     <!-- xs -->
                     <div v-if="viewMgr.isMobile">
                        <v-row class="d-flex align-center text-subtitle-1 mx-0 mt-0">
                           <RouterLink v-for="contact in getEmailContacts(thread)" :to="Route.USER.url + contact.userId" class="mr-2">{{contact.username }}</RouterLink>
                           {{ thread.name }} ({{ thread.emails.length }})
                        </v-row>
                        <v-row class="d-flex justify-end text-overline mx-0 mt-n2 mb-0">
                           {{ getEmailThreadDate(thread.dateModified) }} 
                        </v-row>
                     </div>
                     <!-- regular display -->
                     <div v-else class="d-flex align-center">
                        <v-row class="d-flex align-center text-subtitle-1">
                           <v-col cols="8" class="text-subtitle-1">
                              <RouterLink v-for="contact in getEmailContacts(thread)" :to="Route.USER.url + contact.userId" class="mr-2">{{contact.username }}</RouterLink>
                              {{ thread.name }} ({{ thread.emails.length }})
                           </v-col>
                           <v-col class="d-flex justify-end text-overline">
                              {{ getEmailThreadDate(thread.dateModified) }}
                           </v-col>
                        </v-row>
                     </div>
                  </div>
                  <!-- selected emails -->
                  <div v-if="isSelected(thread)" v-for="email in getEmails(thread)" class="mx-2 mb-2 pt-1 bg-white">
                     <div v-if="viewMgr.isMobile" class="mx-2">
                        <v-row class="d-flex align-center">
                           <v-col class="flex-grow-1 flex-shrink-0">
                              <span class="text-subtitle-1">{{ email.subject }}</span>
                              <v-icon icon="mdi-email-arrow-left" @click="reply(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                           </v-col>
                           <v-col class="d-flex flex-grow-0 flex-shrink-1 justify-end mx-1">
                              <v-icon icon="mdi-trash-can" @click="deleteEmail(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                           </v-col>
                        </v-row>
                        <v-row class="mx-0 mt-0 mb-1">{{ getEmailDate(email.dateCreated) }}</v-row>
                     </div>
                     <div v-else class="mx-2">
                        <v-row class="d-flex align-center">
                           <v-col class="flex-grow-1 flex-shrink-0">
                              <span class="text-subtitle-1">{{ email.subject }}</span>
                              <span class="text-overline ml-2">{{ getEmailDate(email.dateCreated) }}</span>
                              <v-icon icon="mdi-email-arrow-left" @click="reply(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                           </v-col>
                           <v-col class="d-flex flex-grow-0 flex-shrink-1 justify-end mx-1">
                              <v-icon icon="mdi-trash-can"  @click="deleteEmail(thread, email)" color="blue-darken-2" size="small" class="ml-2 pb-1 pointer"/> 
                           </v-col>
                        </v-row>
                     </div>
                     <v-row v-if="email.itemId" class="pt-2 mb-2">
                        <ItemThumb :item="getItem(email.itemId)" :origin="ItemOrigin.EXTERNAL"/>
                        <div v-if="viewMgr.isDesktop">
                           <div>To: <RouterLink :to="Route.USER.url + email.toContact.userId" class="ml-2">{{ email.toContact.username }}</RouterLink></div>
                           <div>From: <RouterLink :to="Route.USER.url + email.fromContact.userId" class="ml-2">{{ email.fromContact.username }}</RouterLink></div>
                           <div>{{ email.content }}</div>
                        </div>
                     </v-row>
                     <div v-if="viewMgr.isMobile || !email.itemId"  class="ml-2">
                        <div>To: <RouterLink :to="Route.USER.url + email.toContact.userId" class="ml-2">{{ email.toContact.username }}</RouterLink></div>
                        <div>From: <RouterLink :to="Route.USER.url + email.fromContact.userId" class="ml-2">{{ email.fromContact.username }}</RouterLink></div>
                        <div>{{ email.content }}</div>
                     </div>
                  </div>
               </v-card-item>
            </v-card>
         </div>
      </div>
      <!-- send email -->
      <div v-else>
         <div style="max-width:600px">
            <div v-if="toContact" class="d-flex align-center">
               To: <RouterLink :to="Route.USER.url + toContact.userId" class="ml-2">{{ toContact.username }}</RouterLink>
               <IconButton @click="clearToContact()" icon="mdi-close-circle"/>
            </div>
            <v-select v-else v-model="toContact" label="To" :items="userContacts" clearable density="compact"/>
            <v-row>
               <v-col>
                  <v-text-field v-model="subject" label="Subject" class=""/>
                  <v-textarea   v-model="content" label="Content"/>
               </v-col>
               <v-col v-if="emailItem">
                  <v-row>
                     <ItemThumb :item="emailItem" :origin="ItemOrigin.EXTERNAL" class="pt-1"/>
                     <IconButton @click="clearItem()" icon="mdi-close-circle" class="float-bottom"/>
                  </v-row>
               </v-col>
            </v-row>
            <div>  
               <v-btn @click="sendEmail()" :disabled="!canSendEmail" color="primary" class="mr-4">send</v-btn>
               <v-btn @click="reset()" color="primary">cancel</v-btn>
            </div>   
         </div>
      </div>
   </div>

   <v-dialog v-model="showDeleteEmailThread" width="auto">
      <DeleteEmailThread :emailThread="selectedEmailThread" @done="showDeleteEmailThread=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteEmail" width="auto">
      <DeleteEmail :emailThread="selectedEmailThread" :email="selectedEmail" @done="showDeleteEmail=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { useEmailStore } from '@/stores/emailStore'
   import { useItemStore } from '@/stores/itemStore'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import DeleteEmailThread from '@/components/email/DeleteEmailThread.vue'
   import DeleteEmail from '@/components/email/DeleteEmail.vue'
   import ItemThumb   from '@/components/item/thumb/ItemThumb.vue'
   import IconButton  from '@/components/util/IconButton.vue'
   import TextButton  from '@/components/util/TextButton.vue'
   import { emailThreadDate, emailDate } from '@/utils/dateUtils'
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const userStore  = useUserStore()
   const userMgr    = useUserMgr()
   const emailStore = useEmailStore()
   const itemStore  = useItemStore()
   const viewStore  = useViewStore()
   const viewMgr      = useViewMgr()
   const showEmailThreads = ref(true)
   const subject = ref('')
   const content = ref('')
   const selectedEmailThreadIds = ref(new Set())
   const showDeleteEmailThread  = ref(false)
   const showDeleteEmail = ref(false)
   const selectedEmailThread = ref(null)
   const emailThreadItems = new Map()
   const selectedEmail = ref(null)
   const toContact = ref(null)
   const emailItemId = ref(null)
   const currEmailThread = ref(null)
   
   onMounted(() => {
      if (viewStore.emailContext) {
         toContact.value = viewStore.emailContext.toContact
         if (viewStore.emailContext.item) {
            subject.value = viewStore.emailContext.item.name
            emailItemId.value = viewStore.emailContext.item.id
         }
         showEmailThreads.value = false
      }
   })

   const myEmailThreadsExist = computed(() => myEmailThreads.value.length)
   const myEmailThreads = computed(() => { 
      const threads = emailStore.myEmailThreads
      threads.sort(function(a, b) { return b.dateModified - a.dateModified })
      return threads
   })

   const getEmailContacts = (thread) => { 
      const contacts = new Map()
      for (const email of thread.emails) {
         const contact = getOtherContact(email)
         if (!contacts.has(contact.userId)) { contacts.set(contact.userId, contact) }
      }
      return Array.from(contacts.values())
   }

   const getOtherContact = (email) => { return email.fromContact.userId == myContact.value.userId  ? email.toContact : email.fromContact }
   const getEmailThreadDate = (timestamp) => { return timestamp ? emailThreadDate(timestamp.toDate()) : "" }
   const getEmailDate       = (timestamp) => { return timestamp ? emailDate(timestamp.toDate()) : "" }
   const getItem = (itemId) => { return emailThreadItems.get(itemId) }
   const isSelected = (thread) => { return selectedEmailThreadIds.value.has(thread.id) }   
   const toggleEmailThread = (thread) => { 
      if (isSelected(thread)) { selectedEmailThreadIds.value.delete(thread.id) }
      else { 
         for (const email of thread.emails) {
            if (email.itemId && !emailThreadItems.has(email.itemId)) { 
               emailThreadItems.set(email.itemId, itemStore.getItem(email.itemId)) }
         }
         selectedEmailThreadIds.value.add(thread.id) 
      }
   }

   const getEmails = (thread) => { 
      const emails = [ ...thread.emails ]
      emails.sort(function(a, b){return a.dateCreated - b.dateCreated}) 
      return emails
   }

   const deleteEmail = (thread, email) => { 
      selectedEmailThread.value = thread
      selectedEmail.value = email
      if (thread.emails.length == 1) { showDeleteEmailThread.value = true }
      else { showDeleteEmail.value = true}
   }                  
   
   const reply = (thread, email) => { 
      toContact.value = getOtherContact(email)
      subject.value = "Re. " + email.subject
      currEmailThread.value = thread
      showEmailThreads.value = false
   }  

   // 
   // Send mail
   //
   const canSendEmail = computed(() => toContact.value && subject.value?.length && content.value?.length)
   const myContact = computed(() => { return getEmailContact(userStore.user) })
   const getEmailContact = (user) => { return { userId: user.id, username: user.username, email: user.email } }
   const emailItem = computed(() => emailItemId.value? itemStore.getItem(emailItemId.value) : null )
   
   const userContacts = computed(() => {
      const contacts = [] // { title: contact."username (fullName)", value: emailContact }
      for (const contact of userMgr.myUserContacts) {
         contacts.push({ title: contact.username + " (" +  contact.fullName + ")", value: getEmailContact(contact) }) 
      }
      return contacts
   })

   const clearToContact = () => {
      toContact.value = null
      viewStore.resetEmailContext()
   }
   
   const clearItem = () => { emailItemId.value = null }

   const sendEmail = () => {
      const email = { toContact: toContact.value, fromContact: myContact.value, subject: subject.value, content: content.value }
      if (emailItemId.value) { email.itemId = emailItemId.value }
      
      if (currEmailThread.value) { emailStore.addEmail(currEmailThread.value.id, email) }
      else { emailStore.addEmailThread(email) }

      reset()
   }

   const reset = () => {
      showEmailThreads.value = true
      toContact.value = null
      currEmailThread.value = null
      subject.value = ""
      content.value = ""
      viewStore.resetEmailContext()
   }
</script>

<style>
</style>
