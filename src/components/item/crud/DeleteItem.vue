<template>
   <DeleteConfirm :type="deleteType" :name="deleteName" @delete="deleteItems()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useItemStore }  from '@/stores/itemStore'
   import { useGalleryMgr } from '@/stores/galleryMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({item: Object, items: Array})
   const emit  = defineEmits([Emit.DONE])
   const itemStore  = useItemStore()
   const galleryMgr = useGalleryMgr()
   const allItems = ref([])
   
   onMounted(() => {
      if (props.item)  { allItems.value.push(props.item) }
      if (props.items) { allItems.value.push(...props.items) }
  })

   const deleteType = computed(() => { return allItems.value.length == 1 ? "Item" : "Items" })
   const deleteName = computed(() => { return allItems.value.length == 1 ? allItems.value[0].name : allItems.value.length + " Items" })
   
   const deleteItems = () => {
      // console.log("deleteItems", allItems.value)
      for (const item of allItems.value) {
         const galleryIds = item.galleryIds ? item.galleryIds : []
         for (const galleryId of galleryIds) {
            galleryMgr.removeItemId(galleryId, item.id)
         }
         itemStore.deleteItem(item.id)
      }

      emit(Emit.DONE)
   }
</script>

<style>
</style>
