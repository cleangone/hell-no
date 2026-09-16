<template>
   <div v-for="user in users" :key="user.id" class="mr-3">
      <UserThumb :user="user" :isSelected="selectedUserId==user.id" emitSelect @select="selectUser(user)" class="mb-2"/>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import UserThumb from './UserThumb.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ users: Array })
   const emit  = defineEmits([ Emit.USER_ID ])
   
   const selectedUserId = ref(null)

   const selectUser = (user) => { 
      selectedUserId.value = user.id == selectedUserId.value  ? null : user.id
      emit(Emit.USER_ID, selectedUserId.value) 
   }
</script>

<style>
</style>
