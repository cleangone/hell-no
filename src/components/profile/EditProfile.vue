<template>
   <v-card title="Edit Profile" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="username" label="Username" :rules="usernameRules" class="ma-3"></v-text-field>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid || !dataChanged">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useProfileStore } from '@/stores/profileStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ profile: Object })
   const emit = defineEmits([ Emit.DONE ])

   const profileStore = useProfileStore()
   const username = ref('')
   const dataValid = ref(true)
   
   onMounted(() => {
      username.value = props.profile.username
   })
   
   const usernameRules = computed(() => [
      ...requiredRule,
      v => { return (v != props.profile.username) && profileStore.usernames.has(v) ? "Username already exists" : true }
   ])
   
   const dataChanged = computed(() => username.value != props.profile.username)

   const save = () => {
      profileStore.updateProfile({ id: props.profile.id, username: username.value })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
