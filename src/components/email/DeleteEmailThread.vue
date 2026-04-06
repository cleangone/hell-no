<template>
   <DeleteConfirm type="Email" :name="props.emailThread.name" @delete="deleteEmailThread()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useEmailStore } from '@/stores/emailStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ emailThread: Object })
   const emit = defineEmits([Emit.DONE])
   const emailStore = useEmailStore()
            
   const deleteEmailThread = () => {
      emailStore.deleteEmailThread(props.emailThread.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
