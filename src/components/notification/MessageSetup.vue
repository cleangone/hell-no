<template>  
   <div v-if="!props.disableDisplay" class="text-left ma-4 pa-1 border"> 
      <div v-if="tokenResult.token">Messaging Token: {{ tokenResult.token }}</div>
      <div v-if="tokenResult.error"> {{ tokenResult.error }}</div>
   </div> 
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { messaging } from '@/firebase'
   import { getToken } from "firebase/messaging"
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { FirebaseCloudMessagingConfig } from '@/config/config'
   
   const props = defineProps({ disableDisplay: Boolean })
   
   const userStore = useUserStore()
   const userMgr   = useUserMgr()
   const tokenResult = ref({})

   onMounted(() => {
      // console.log("MessageSetup")
      getMessagingToken()
   })

   const getMessagingToken = () => {
      const vapidKey = FirebaseCloudMessagingConfig.publicKey
      // console.log("getMessagingToken.vapidKey", vapidKey)

      if (!userStore.userExists) { 
         tokenResult.value.error = "User not set - bypassing registration token" 
         return
      }

      console.log("Requesting notification permission")
      Notification.requestPermission().then((permission) => {
         if (permission === 'granted') {
            console.log("Notification permission granted")
            console.log("Getting token")
            getToken(messaging, vapidKey).then((currentToken) => {
               if (currentToken) {
                  console.log("Permission granted, got token")
                  tokenResult.value.token = currentToken

                  const deviceMatch = navigator.userAgent.match(/iPhone|iPad|iPod|Firefox|Chrome/) // returns an array of matches
                  const device = deviceMatch.length ? deviceMatch[0] : "unknown"
                  console.log("device", device)
                  const isStandalone = window.matchMedia('(display-mode: standalone)').matches  // works on ios, but not chrome
                  console.log("isStandalone", isStandalone)
                  
                  userMgr.addMessagingToken(device, currentToken) 
               } 
               else {
                  // Show permission request UI
                  console.log("No registration token available. Request permission to generate one")
                  tokenResult.value.error = "Registration token not available"
               }
            }).catch((err) => {
               console.log('Error occurred while retrieving token', err)
               tokenResult.value.error = "Error retrieving token: " + err.message
            })
         }
         else {
            console.log("Notification permission not granted:", permission)
            tokenResult.value.error = "Notification permission not granted: " + permission.toString()
         }
      })
      .catch((err) => {
         console.log("Notification permission error", err)
         tokenResult.value.error = "Notification permission error: " + err.message
      })
   }
</script>
