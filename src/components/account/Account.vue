<template>
   <div>
      <div class="text-left"> 
         {{ user.email }} 
         <TextButton @click="showEditEmail=true"    text="Edit Email"/>
         <TextButton @click="showEditPassword=true" text="Edit Password"/>
      </div>
      <v-form v-model="dataValid" class="mt-2">
         <v-row>
            <v-col>
               <v-text-field v-model="firstName" label="First Name" :rules="requiredRule"/>   
            </v-col>
            <v-col>
               <v-text-field v-model="lastName" label="Last Name"/>         
            </v-col>
         </v-row>
         <v-row class="mt-n5">
            <v-col>
               <v-text-field v-model="username" label="Username" :rules="requiredRule"/>
               <v-text-field v-model="phone"    label="Phone"/>
            </v-col>
            <v-col/>
         </v-row>
         <v-row class="mt-n7">
            <v-checkbox v-model="soloMode" label="Solo Mode - only view/manage my collection" class="tight-checkbox ms-1"/>
         </v-row>
         <v-row class="mt-5">
            <v-col>
               <div style="font-size: medium; font-weight: bold" class="text-left">Notifications</div>
               <v-layout class="mx-3 mt-4 tight-checkbox">
                  <v-sheet class="d-flex align-center">
                     <v-checkbox v-model="notifyViaEmail" label="By Email" class="shrink mr-2"></v-checkbox>
                     <v-radio-group v-if="viewMgr.isDeskTop && notifyViaEmail" v-model="settings.notifyViaEmail" inline>
                        <v-radio label="Immediate/Individual" :value="NotificationOptions.IMMEDIATE"/>
                        <v-radio label="Daily/Batched"        :value="NotificationOptions.DAILY"/>
                     </v-radio-group>
                  </v-sheet>
               </v-layout>
               <v-radio-group v-if="viewMgr.isMobile && notifyViaEmail" v-model="settings.notifyViaEmail" inline class="ml-8 mt-n3">
                  <v-radio label="Immediate/Individual" :value="NotificationOptions.IMMEDIATE"/>
                  <v-radio label="Daily/Batched"        :value="NotificationOptions.DAILY"/>
               </v-radio-group>
               <v-checkbox v-model="notifyViaMessage" label="By Message" class="mx-3 mt-n4 tight-checkbox"/>
            </v-col>
         </v-row>
      </v-form> 
   </div>   
   <div class="mt-8 mb-2 text-left">
      <v-btn @click="updateUser()" :disabled="!dataValid || !dataUpdated">Update</v-btn>
      <v-btn @click="resetUser()" class="mx-2">Reset</v-btn>
   </div>

   <v-dialog v-model="showEditEmail" width="auto">
      <EditEmail :user="user" @done="showEditEmail=false"/>
   </v-dialog>
   <v-dialog v-model="showEditPassword" width="auto">
      <EditPassword :userId="user.id" @done="showEditPassword=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import EditEmail    from '@/components/user/EditEmail.vue'
   import EditPassword from '@/components/user/EditPassword.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { requiredRule } from '@/utils/utils'
   import { NotificationOptions } from '@/utils/constants'
   
   const DEFAULT_SETTINGS =  { "notifyViaEmail": NotificationOptions.NEVER, "notifyViaMessage": NotificationOptions.NEVER }
   const userStore  = useUserStore()
   const viewMgr    = useViewMgr()   
   const firstName = ref(userStore.user.firstName)
   const lastName  = ref(userStore.user.lastName)
   const username  = ref(userStore.user.username)
   const phone     = ref(userStore.user.phone)
   const settings  = ref(userStore.user.settings ? { ...userStore.user.settings } : { ...DEFAULT_SETTINGS })
   const showEditEmail    = ref(false)
   const showEditPassword = ref(false)
   const dataValid = ref(true)
   
   const user = computed(() => userStore.user ? userStore.user : {} )
   
   const resetUser = () => {
      firstName.value = user.value.firstName
      lastName.value  = user.value.lastName
      username.value  = user.value.username
      phone.value     = user.value.phone
      settings.value  = user.value.settings ? { ...user.value.settings } : { ...DEFAULT_SETTINGS }
   }

   const soloMode = computed({ 
      get() { return settings.value.soloMode },
      set(solo) { settings.value.soloMode = solo }
   })

   const notifyViaEmail = computed({ 
      get() { return settings.value.notifyViaEmail != NotificationOptions.NEVER },
      set(notify) { settings.value.notifyViaEmail = notify ? NotificationOptions.IMMEDIATE : NotificationOptions.NEVER }
   })

   const notifyViaMessage = computed({ 
      get() { return settings.value.notifyViaMessage != NotificationOptions.NEVER },
      set(notify) { settings.value.notifyViaMessage = notify ? NotificationOptions.IMMEDIATE : NotificationOptions.NEVER }
   })
   
   const dataUpdated = computed(() => 
      firstName.value != user.value.firstName ||
      lastName.value  != user.value.lastName  ||
      username.value != user.value.username   ||
      phone.value    != user.value.phone      ||
      settings.value.soloMode         != user.value.settings?.soloMode ||
      settings.value.notifyViaEmail   != user.value.settings?.notifyViaEmail  ||
      settings.value.notifyViaMessage != user.value.settings?.notifyViaMessage)
   
   const updateUser = () => { 
      userStore.updateUser({
         id: user.value.id, 
         firstName: firstName.value,
         lastName: lastName.value, 
         username: username.value, 
         phone: phone.value, 
         settings: settings.value }) 
   }
</script>

<style>
</style>
