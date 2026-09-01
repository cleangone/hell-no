<template>
   <div :class="paddingX">
      <ItemThumbGroup v-if="isItemGroup" :item="item" :origin="origin" :size="size" 
         :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"
         :emitPopup="emitPopup" @popup="onPopup"/>
      <ItemThumbSingle v-else :item="item" :origin="origin" :size="size" 
         :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed" 
         :emitPopup="emitPopup" @popup="onPopup"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useItemMgr }  from '@/stores/itemMgr'
   import { useViewMgr }  from '@/stores/viewMgr'
   import ItemThumbSingle from './ItemThumbSingle.vue'
   import ItemThumbGroup  from './ItemThumbGroup.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ 
      item: Object, origin: String, size: String, 
      useAltName: Boolean, useLocalName: Boolean, 
      bypassShowUser:Boolean, showDateViewed:Boolean, emitPopup: Boolean })
   const emit = defineEmits([ Emit.POPUP ])

   const itemMgr = useItemMgr()
   const viewMgr = useViewMgr()

   const paddingX    = computed(() => viewMgr.isXs ? "px-0" : "px-4")
   const isItemGroup = computed(() => itemMgr.isItemGroup(props.item))

   const onPopup = (popup) => { emit(Emit.POPUP, popup) }
</script>

<style>
</style>
