<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>
      <v-list v-model:selected="selectedFields" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">{{ title }} Thumbnails</v-list-item-title>     
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
   import { computed, onMounted } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton from '@/components/util/IconButton.vue'
   import { removeArrayEntry } from '@/utils/utils'
   import { ThumbField, ThumbFields } from '@/utils/constants'

   const props = defineProps({ origin: String, additionalFields: Array })
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const thumbFields = []

   onMounted(() => { 
      if (props.additionalFields) {
         const initialSelectedFields = [ ...viewStore.visibleThumbFields.get(props.origin) ] 
         for (const additionalField of props.additionalFields) {
            thumbFields.push(additionalField.title)
            if (additionalField.value) { 
               initialSelectedFields.push(additionalField.title)
               viewStore.setVisibleThumbFields(props.origin, initialSelectedFields)
            } 
         }
      }
      thumbFields.push(...ThumbFields)
      if (viewMgr.solo) { removeArrayEntry(thumbFields, ThumbField.USER) }
      // console.log("thumbFields", thumbFields)
   })
   
   // todo - props override - use for galleriesView
   const title = computed(() => props.origin.charAt(0).toUpperCase() + props.origin.slice(1))
         
   const selectedFields = computed({ 
      get() { return viewStore.visibleThumbFields.get(props.origin) },
      set(fields) { viewStore.setVisibleThumbFields(props.origin, fields) } 
   })
</script>

<style>
</style>
