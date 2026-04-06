<template>
   <DeleteConfirm type="Group" :name="props.group.name" @delete="deleteGroup()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useGroupStore } from '@/stores/groupStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({group: Object})
   const emit = defineEmits([Emit.DONE])
   const groupStore = useGroupStore()
   
   const deleteGroup = () => {
      // group cleanup handled by backend
      groupStore.deleteGroup(props.group.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
