<template>
   <DeleteConfirm type="Group User" :name="props.groupUser.username" @delete="deleteGroupUser()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useGroupStore } from '@/stores/groupStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ groupUser: Object })
   const emit = defineEmits([Emit.DONE]);
   const groupStore = useGroupStore()
   
   const deleteGroupUser = () => {
      // no harm to remove an array entry that doesn't exist
      groupStore.removeUserId(props.groupUser.groupId, props.groupUser.id)
      groupStore.removeInvitedId(props.groupUser.groupId, props.groupUser.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
