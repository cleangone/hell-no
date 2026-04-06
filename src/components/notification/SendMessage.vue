<template>
   <div class="text-left ma-4 pa-1 border">
      <div v-if="messagingTokens.length">
         <v-form class="mx-1">
            <v-row style="width:100%">
               <v-col cols="4"><v-text-field v-model="messageTitle" label="Message Title"/></v-col>
               <v-col><v-text-field v-model="messageBody" label="Message Body"/></v-col>
            </v-row>
            <v-row style="width:100%">
               <v-col cols="4"><v-text-field v-model="delay" label="Delay (Seconds)" type="number"/></v-col>
            </v-row>
         </v-form>
         <div class="mx-1 text-left">
            <span>
               <v-btn @click="sendMessage()" :disabled="!messageTitle.length || !messageBody.length">Send</v-btn> {{   }}
               <span v-if="sentMessage">Message Sent: {{ sentMessage  }}</span>
            </span>
         </div>
      </div>
      <div v-else>No Messaging Tokens</div>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useMessageStore } from '@/stores/messageStore'
   
   const userStore    = useUserStore()
   const messageStore = useMessageStore()
   const messageTitle = ref('')
   const messageBody = ref('')
   const delay = ref(0)
   const sentMessage = ref(null)

   const user = computed(() => userStore.user)
   const messagingTokens = computed(() => user.value?.messagingTokens ? user.value.messagingTokens : [])
   const sendMessage = () => { 
      const delayTitle = messageTitle.value
      const delayBody = messageBody.value
      setTimeout(function() { 
         messageStore.addMessage(delayTitle, delayBody, user.value) 
         sentMessage.value = delayTitle + " - " + delayBody
      }, delay.value*1000 + 100)

      messageTitle.value = ""
      messageBody.value  = ""
   }
</script>

