<template>
   <DeleteConfirm type="Channel" :name="props.channel.name" @delete="deleteChannel()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useChannelStore } from '@/stores/channelStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ channel: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const channelStore = useChannelStore()
   
   const deleteChannel = () => {
      channelStore.deleteChannel(props.channel.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
