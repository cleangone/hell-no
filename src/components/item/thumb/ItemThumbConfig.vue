<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>
      <v-list v-model:selected="selectedFields" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">Thumbnails</v-list-item-title>     
         <v-list-item v-for="field in thumbFields" :key="field" :title="field" :value="field">
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
   import IconButton from '@/components/util/IconButton.vue'
   import { ThumbOptionsItem } from '@/utils/constants'

   const viewStore = useViewStore()
   const thumbFields = [ ThumbOptionsItem.TITLE, ThumbOptionsItem.ARTIST, ThumbOptionsItem.UPDATED, ThumbOptionsItem.USER ]
     
   const selectedFields = computed({ 
      get() { return viewStore.itemThumbOptions },
      set(fields) { viewStore.setItemThumbOptions(fields) } 
   })
</script>

<style>
</style>
