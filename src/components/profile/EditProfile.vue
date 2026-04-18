<template>
   <v-card title="Edit Group" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="profileName" label="Profile name" :rules="nameRules" class="ma-3"></v-text-field>
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
   const emit = defineEmits([Emit.DONE])

   const profileStore = useProfileStore()
   const profileName = ref('')
   const dataValid = ref(true)
   
   onMounted(() => {
      profileName.value = props.profile.name
   })
   
   const nameRules = computed(() => [
      ...requiredRule,
      v => { return (v != props.profile.name) && profileStore.profileNames.has(v) ? "Name already exists" : true }
   ])
   
   const dataChanged = computed(() => profileName.value != props.profile.name)

   const save = () => {
      profileStore.updateProfile({ id: props.profile.id, name: profileName.value })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
