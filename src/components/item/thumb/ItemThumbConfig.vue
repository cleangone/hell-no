<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>
      <v-list v-model:selected="selectedOptions" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">Thumbnails</v-list-item-title>     
         <v-list-item v-for="option in allOptions" :key="option" :title="option" :value="option">
            <template v-slot:prepend="{ isSelected }">
               <v-list-item-action start>
                  <v-checkbox-btn :model-value="isSelected"></v-checkbox-btn>
               </v-list-item-action>
            </template>
         </v-list-item>
      </v-list>
   </v-menu>  
</template>

<script setup>
   import { computed } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton       from '@/components/util/IconButton.vue'
   import { ItemThumbOptions as ThumbOptions } from '@/utils/constants'

   const viewStore = useViewStore()
   const viewMgr    = useViewMgr()
   
   const defaultOptions = [ ThumbOptions.TITLE, ThumbOptions.ARTIST, ThumbOptions.USER, ThumbOptions.UPDATED ]  
   const allOptions = computed(() => {
       const options = viewMgr.isXs ? [ ThumbOptions.SM_THUMB ] : [  ThumbOptions.LG_THUMB ]
       options.push(...defaultOptions)
       return options
   })

   const selectedOptions = computed({ 
      get() { return viewStore.itemThumbOptions },
      set(fields) { viewStore.setItemThumbOptions(fields) } 
   })
</script>

<style>
</style>
