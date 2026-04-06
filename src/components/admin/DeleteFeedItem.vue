<template>
   <DeleteConfirm type="Feed Item" :name="props.feedItem.name" @delete="deleteItem()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useFeedStore } from '@/stores/feedStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ feedId: String, feedItem: Object })
   const emit = defineEmits([Emit.DONE])
   const feedStore = useFeedStore()
    
   const deleteItem = () => {
      feedStore.deleteFeedItem(props.feedId, props.feedItem) 
      emit(Emit.DONE)
   }
</script>

<style>
</style>
