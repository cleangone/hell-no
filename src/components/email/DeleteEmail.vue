<template>
   <DeleteConfirm type="Email" :name="props.email.subject" @delete="deleteEmail()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useEmailStore } from '@/stores/emailStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ emailThread: Object, email: Object })
   const emit = defineEmits([Emit.DONE])
   const emailStore = useEmailStore()
            
   const deleteEmail = () => {
      emailStore.deleteEmail(props.emailThread.id, props.email)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
