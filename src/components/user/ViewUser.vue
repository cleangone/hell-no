<template>
    <v-card title="User" class="edit-dialog"> 
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>   
      <div class="px-4 pb-8">
         <v-row no-gutters>
            <v-col cols="5" >
               <HorizontalDiv>
                  <Avatar v-if="avatar" :image="avatar" class="mt-1 mr-2" />
                  <v-text-field v-model="user.firstName" label="First Name" readonly/>
               </HorizontalDiv>
            </v-col>
            <v-col class="ml-2">
               <v-text-field v-model="user.lastName" label="Last Name" readonly/>         
            </v-col>
         </v-row>
         <v-row no-gutters class="mt-n3">
            <v-col cols="5"><v-text-field v-model="user.username" label="Username" readonly/></v-col>
            <v-col class="ml-2"><v-text-field v-model="user.displayName" label="Display Name" readonly/></v-col>
         </v-row>
         <v-row no-gutters class="mt-n3">
            <v-col cols="5"><v-text-field v-model="user.phone" label="Phone" readonly/></v-col>
            <v-col class="ml-2"><v-text-field v-model="user.hostname" label="Hostname" readonly/></v-col>
         </v-row>
         <v-row class="mt-n7">
            <v-checkbox v-model="soloMode" label="Solo Mode - only view/manage my collection" class="tight-checkbox ms-1"/>
         </v-row>
         <v-row class="mt-5">
            <v-col>
               <div style="font-size: medium; font-weight: bold" class="text-left">Notifications</div>
               <v-layout class="mx-3 mt-4 tight-checkbox">
                  <v-sheet class="d-flex align-center">
                     <v-checkbox v-model="notifyViaEmail" label="By Email" readonly class="shrink mr-2"></v-checkbox>
                     <v-radio-group v-if="notifyViaEmail" v-model="settings.notifyViaEmail" inline readonly>
                        <v-radio label="Immediate/Individual" :value="Options.IMMEDIATE"/>
                        <v-radio label="Daily/Batched"        :value="Options.DAILY"/>
                     </v-radio-group>
                  </v-sheet>
               </v-layout>
               <v-checkbox v-model="notifyViaMessage" label="By Message" readonly class="mx-3 mt-n4 tight-checkbox"/>
            </v-col>
         </v-row>
      </div>
   </v-card>  
</template>

<script setup>
   import { computed }   from 'vue'
   import { useUserMgr } from '@/stores/userMgr'
   import Avatar         from '@/components/user/Avatar.vue'
   import HorizontalDiv  from '@/components/util/HorizontalDiv.vue'
   import IconButton     from '@/components/util/IconButton.vue'
   
   import { DefaultUserSettings, NotificationOptions as Options } from '@/utils/constants'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ user: Object })
   
   const userMgr  = useUserMgr() 
   const settings = props.user.settings ?? DefaultUserSettings

   const avatar           = computed(() => userMgr.getAvatar(props.user))
   const soloMode         = computed(() => settings.soloMode)
   const notifyViaEmail   = computed(() => settings.notifyViaEmail != Options.NEVER)
   const notifyViaMessage = computed(() => settings.notifyViaMessage != Options.NEVER)

</script>

<style>
</style>
