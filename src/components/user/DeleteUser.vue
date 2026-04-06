<template>
   <DeleteConfirm type="User" :name="fullName" @delete="deleteUser()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useUserMgr }   from '@/stores/userMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ user: Object })
   const emit = defineEmits([Emit.DONE])
   const userStore = useUserStore()
   const userMgr   = useUserMgr()
   
   const fullName = computed(() => userMgr.getFullName(props.user))
  
   const deleteUser = () => {
      userStore.deleteUser(props.user.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
