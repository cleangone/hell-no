<template>
   <v-card title="Add Profile" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="username"  label="Username"   :rules="usernameRules" class="ma-3"></v-text-field>
            <v-text-field v-model="firstName" label="First Name" :rules="requiredRule"  class="ma-3"></v-text-field>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps([ 'userId' ])
   const emit = defineEmits([Emit.DONE])

   const userStore = useUserStore()
   const userMgr   = useUserMgr()
   const username  = ref('')
   const firstName = ref('')
   const dataValid = ref(true)
   
   const usernameRules = computed(() => [
      ...requiredRule,
      v => { return userStore.usernames.has(v) ? "Username already exists" : true }
   ])

   const save = () => {
      userMgr.addProfileUser({
         ownerId:   userStore.userId,
         username:  username.value,
         firstName: firstName.value,
         email:     userStore.user.email,
      })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
