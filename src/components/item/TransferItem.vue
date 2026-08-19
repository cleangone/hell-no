<template>
   <v-card title="Transfer Item" class="edit-dialog">
      <v-form v-model="dataValid" class="mx-7">
         <v-row>
            <v-col class="d-flex flex-column align-center">
               {{ item.name }}
               <v-img v-if="primaryImage" :src="primaryImage.thumbUrl" width="200"/>
            </v-col>
            <v-col>
               <div class="font-weight-bold">Transfer to:</div>
               <v-select v-model="selectedUser" label="User" :items="users" item-title="username" 
                  item-value="id" return-object :rules="requiredRule"/>
            </v-col>
         </v-row>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="transfer()" :disabled="!dataValid">transfer</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { useItemStore }    from '@/stores/itemStore'
   
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item: Object })
   const emit = defineEmits([Emit.DONE])

   const userStore = useUserStore()
   const userMgr   = useUserMgr()
   const itemStore = useItemStore()
   
   const selectedUser = ref(null)
   const dataValid    = ref(true)
   
   const primaryImage = computed(() => props.item.primaryImage)
   
   // currently can transfer between profile/owner
   const users = computed(() => {
      const xferUsers = userStore.user.ownerId ? [ userStore.getUser(userStore.user.ownerId) ] : userMgr.myProfiles
      if (xferUsers.length == 1) { selectedUser.value = xferUsers[0] }

      return xferUsers
   }) 

   const transfer = () => {
      itemStore.updateItem({ id: props.item.id, userId: selectedUser.value.id })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
