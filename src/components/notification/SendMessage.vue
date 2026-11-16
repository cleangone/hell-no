<template>
   <div class="text-left ma-4 pa-1 border">
      <div class="mx-3">
         <v-checkbox v-for="checkbox in checkboxes" :key="checkbox.user.id"
            v-model="checkbox.isSelected" :label="checkbox.user.username" hide-details/>
      </div>   
      <v-row class="w-100 mx-1">
         <v-col cols="4"><v-text-field v-model="messageTitle" label="Message Title"/></v-col>
         <v-col><v-text-field v-model="messageBody" label="Message Body"/></v-col>
      </v-row>
      <div class="mx-3 mb-2">
         <v-btn @click="sendMessage()" :disabled="!canSend">Send</v-btn>
      </div>
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { usePushMessageMgr } from '@/stores/pushMessageMgr'
   
   const userStore    = useUserStore()
   const pushMessageMgr = usePushMessageMgr()
   const checkboxes   = ref([])
   const messageTitle = ref('')
   const messageBody  = ref('')

   onMounted(() => {
      for (const user of userStore.users) { 
         if (user.pushMessageTokens?.length) { 
            checkboxes.value.push({ user: user, isSelected: false }) 
         }
      }
   })
   
   const selectedUsers = computed(() => { 
      const users = []
      for (const checkbox of checkboxes.value) {
         if (checkbox.isSelected) { users.push(checkbox.user) }
      }
      return users
   })

   const canSend = computed(() => selectedUsers.value.length && messageTitle.value.length && messageBody.value.length)
   const sendMessage = () => { 
      pushMessageMgr.addPushMessages(messageTitle.value, messageBody.value, selectedUsers.value) 
      messageTitle.value = ""
      messageBody.value  = ""
   }

</script>

