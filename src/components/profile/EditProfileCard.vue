<template>
   <v-card class="edit-profile">
      <v-card-title class="d-flex align-center">
         <span> 
            <span class="text-h6">{{title}}</span>
            <TextButton v-if="editProfile" text="Edit Images" @click="editProfile=false" class="mx-3"/>
            <TextButton v-else text="Edit Profile" @click="editProfile=true" class="mx-3"/>
         </span>
         <v-spacer></v-spacer>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </v-card-title>
      <div v-if="editProfile">
         <EditProfile :profile="props.profile" @done="$emit(Emit.DONE)"/>
      </div>
      <div v-else>
         <EditProfileImages :profileId="props.profile.id"/>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import EditProfile       from './EditProfile.vue'
   import EditProfileImages from './EditProfileImages.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ profile: Object })
   const emit = defineEmits([ Emit.DONE ])

   const editProfile = ref(true)
   const title = computed(() => editProfile.value ? "Edit Profile" :  "Edit Profile Images")
</script>

<style>
.edit-profile {
   min-width: 500px;  
   min-height: 300px;  
}
</style>
