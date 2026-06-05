<template>
   <v-expansion-panel class="mb-3">
      <v-expansion-panel-title>
         <span style="font-size: medium; font-weight: bold" class="pe-2">{{ type }}</span>     
         {{ selectedNames }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
         <v-row class="mb-2">
            <CheckboxCol v-for="chkboxCol in checkboxCols" :key="chkboxCol" :checkboxes="chkboxCol" class="mx-3"/>
         </v-row>
      </v-expansion-panel-text>
   </v-expansion-panel>
</template>

<script setup>
   import { computed } from 'vue'
   import CheckboxCol from './CheckboxCol.vue'
   
   const props = defineProps({ type:String, checkboxes:Array, cols:Number })
   
   const checkboxFamilies = computed(() => {
      const families = []
      const idToCheckbox = new Map()
      
      for (const checkbox of props.checkboxes) {
         checkbox.children = []
         idToCheckbox.set(checkbox.id, checkbox)
         if (checkbox.parentId && idToCheckbox.has(checkbox.parentId)) {
            const parent = idToCheckbox.get(checkbox.parentId)
            parent.children.push(checkbox) 
         }
         else { families.push(checkbox) } 
      }

      return families
   })
   
   const checkboxCols = computed(() => {
      const cols = []
      const numCols = props.cols ? props.cols : 3
      for (var i=0; i<numCols; i++) { 
         cols.push([])
      }

      // add top level checkboxes to cols
      for (let i=0; i<checkboxFamilies.value.length; i++) {
         const colIndex = Math.floor(i * cols.length / checkboxFamilies.value.length)
         cols[colIndex].push(checkboxFamilies.value[i])
      }
      return cols
   })

   const selectedNames = computed(() => { 
      const names = []
      for (const checkbox of props.checkboxes) {
         if (checkbox.isSelected) { names.push(checkbox.name) }
      }
      return names.join(", ")
   })
</script>
