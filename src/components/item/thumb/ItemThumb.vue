<template>
   <div :class="paddingX">
      <ItemThumbGroup v-if="isItemGroup" :item="item" :origin="origin" :useAltName="useAltName" 
         :useLocalName="useLocalName" :bypassShowUser="bypassShowUser" :admin="admin"/>
      <ItemThumbSingle v-else :item="item" :origin="origin" :useAltName="useAltName" 
         :useLocalName="useLocalName" :bypassShowUser="bypassShowUser" :admin="admin"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import { ItemThumbOptions as ThumbOptions } from '@/utils/constants'
   
   import ItemThumbSingle from './ItemThumbSingle.vue'
   import ItemThumbGroup  from './ItemThumbGroup.vue'
   
   const props = defineProps({ item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean,
      bypassShowUser:Boolean, admin: Boolean, 
   })
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()

   const smallThumb  = computed(() => viewMgr.isXs && viewStore.itemThumbOptions.includes(ThumbOptions.SM_THUMB))
   const paddingX    = computed(() => smallThumb.value ?  "px-1" : "px-4")
   const isItemGroup = computed(() => itemMgr.isItemGroup(props.item))
</script>

<style>
</style>
