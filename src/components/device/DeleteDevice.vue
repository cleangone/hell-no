<template>
   <DeleteConfirm type="Device" :name="props.device.name" @delete="deleteDevice()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useDeviceStore } from '@/stores/deviceStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ device: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const deviceStore = useDeviceStore()
   
   const deleteDevice = () => {
      deviceStore.deleteDevice(props.device.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
