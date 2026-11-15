<template>
   <div class="text-left ma-4 pa-1 border">
      <div v-if="messageTokens.length">
         <v-form class="mx-1">
            <v-row style="width:100%">
               <v-col cols="4"><v-text-field v-model="messageTitle" label="Message Title"/></v-col>
               <v-col><v-text-field v-model="messageBody" label="Message Body"/></v-col>
            </v-row>
            <!-- <v-row style="width:100%">
               <v-col cols="4"><v-text-field v-model="delay" label="Delay (Seconds)" type="number"/></v-col>
            </v-row> -->
         </v-form>
         <div class="mx-1 text-left">
            <span>
               <v-btn @click="sendMessage()" :disabled="!messageTitle.length || !messageBody.length">Send</v-btn> {{   }}
               <!-- <span v-if="sentMessage">Message Sent: {{ sentMessage  }}</span> -->
            </span>
         </div>
      </div>
      <div v-else>No Message Tokens</div>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { usePushMessageStore } from '@/stores/pushMessageStore'
   
   const userStore    = useUserStore()
   const pushMessageStore = usePushMessageStore()
   const messageTitle = ref('')
   const messageBody  = ref('')

   // todo - select user
   const user = computed(() => userStore.user)
   const messageTokens = computed(() => user.value?.pushMessageTokens ?? [])

   const sendMessage = () => { 
      pushMessageStore.addPushMessage(messageTitle.value, messageBody.value, user.value) 

      messageTitle.value = ""
      messageBody.value  = ""
   }

</script>

