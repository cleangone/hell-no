<template>
   <div :class="paddingX">
      <ItemThumbGroup v-if="isItemGroup" :item="item" :origin="origin" :useAltName="useAltName" 
         :useLocalName="useLocalName" :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
      <ItemThumbSingle v-else :item="item" :origin="origin" :useAltName="useAltName" 
         :useLocalName="useLocalName" :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useItemMgr }  from '@/stores/itemMgr'
   import { useViewMgr }  from '@/stores/viewMgr'
   import ItemThumbSingle from './ItemThumbSingle.vue'
   import ItemThumbGroup  from './ItemThumbGroup.vue'
   
   const props = defineProps({ 
      item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, bypassShowUser:Boolean, showDateViewed:Boolean })
   
   const itemMgr = useItemMgr()
   const viewMgr = useViewMgr()

   const paddingX    = computed(() => viewMgr.isXs ? "px-0" : "px-4")
   const isItemGroup = computed(() => itemMgr.isItemGroup(props.item))
</script>

<style>
</style>
