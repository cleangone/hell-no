<template>
   <v-expansion-panel class="mb-3">
      <v-expansion-panel-title>
         <span style="font-size: medium; font-weight: bold" class="pe-2">{{ type }}</span>     
         {{ selectedNames }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
         <v-row class="mb-2">
            <CheckboxCol v-for="checkboxCol in checkboxCols" :key="checkboxCol" :objCol="checkboxCol" class="mx-3"/>
         </v-row>
      </v-expansion-panel-text>
   </v-expansion-panel>
</template>

<script setup>
   import { computed } from 'vue'
   import CheckboxCol from './CheckboxCol.vue'
   
   const props = defineProps({ type: String, checkboxes: Array, cols: Number })
   
   const checkboxCols = computed(() => {
      const cols = []
      const numCols = props.cols ? props.cols : 3
      for (var i=0; i<numCols; i++) { 
         cols.push([])
      }

      if (props.checkboxes) {
         let index = 0
         for (const checkbox of props.checkboxes) {
            const col = Math.floor(index * cols.length / props.checkboxes.length)
            cols[col].push(checkbox)
            index++
         }
      }
      return cols
   })

   const selectedNames = computed(() => { 
      const names = []
      for (const checkbox of props.checkboxes) {
         if (checkbox.selected) { names.push(checkbox.name) }
      }
      return names.join(", ")
   })
</script>
