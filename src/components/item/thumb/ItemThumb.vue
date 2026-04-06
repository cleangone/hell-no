<template>
   <div :class="paddingX">
      <ItemThumbGroup v-if="isItemGroup" :item="item" :origin="origin" 
         :useAltName="useAltName" :useLocalName="useLocalName" :admin="admin"/>
      <ItemThumbSingle v-else :item="item" :origin="origin"
         :useAltName="useAltName" :useLocalName="useLocalName" :admin="admin"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import ItemThumbSingle from './ItemThumbSingle.vue'
   import ItemThumbGroup  from './ItemThumbGroup.vue'
   
   const props = defineProps({ 
      item: Object, 
      origin: String, 
      useAltName:   Boolean,
      useLocalName: Boolean,
      admin:        Boolean, 
      tight:        Boolean, // not propagated
   })
   const itemMgr = useItemMgr()

   const paddingX    = computed(() => props.tight ?  "" : "px-5")
   const isItemGroup = computed(() => itemMgr.isItemGroup(props.item))
</script>

<style>
</style>
