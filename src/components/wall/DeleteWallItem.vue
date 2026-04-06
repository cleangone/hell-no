<template>
   <DeleteConfirm type="Wall Item" :name="'the ' + props.wallItem.name + ' wall item'" @delete="deleteWallItem()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useWallMgr } from '@/stores/wallMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ wallItem: Object, wallId: String  })
   const emit  = defineEmits([Emit.DONE])
   const wallMgr = useWallMgr()
   
   const deleteWallItem = () => {
      wallMgr.deleteWallItem(props.wallItem, props.wallId)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
