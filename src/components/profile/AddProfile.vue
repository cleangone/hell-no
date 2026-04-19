<template>
   <v-card title="Add Profile" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="username" label="Username" :rules="usernameRules" class="ma-3"></v-text-field>
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
   import { useProfileStore } from '@/stores/profileStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps([ 'userId' ])
   const emit = defineEmits([Emit.DONE])

   const profileStore = useProfileStore()
   const username = ref('')
   const dataValid = ref(true)
   
   const usernameRules = computed(() => [
      ...requiredRule,
      v => { return profileStore.usernames.has(v) ? "Username already exists" : true }
   ])

   const save = () => {
      profileStore.addProfile(username.value, props.userId)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
