<template>
   <div class="text-left ma-4 pa-1 border"> 
      <div>Received Message: {{ message }}</div>
  </div> 
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   // import { messaging } from '@/firebase'
   // import { onMessage } from "firebase/messaging"
   import { getMessaging, onMessage } from "firebase/messaging";


   const message = ref("")

   onMounted(async() => {
      console.log("MessageHandler")
      const messaging = getMessaging()
      onMessage(messaging, (payload) => {
         console.log('Message received', payload)
         message.value = payload.data
      })
   })
</script>
