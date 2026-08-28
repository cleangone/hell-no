<template>
   <v-col>
      <div v-for="checkbox in visibleCheckboxes" :key="checkbox.id" class="d-flex align-center tight-checkbox">
         <ToolTipHover v-if="isAbbrev(checkbox)" :text="checkbox.name" v-slot="{ props }">
            <v-checkbox v-bind="props" v-model="checkbox.isSelected" :label="label(checkbox)" density="compact" hide-details class="py-0"/>
         </ToolTipHover>         
         <v-checkbox v-else v-model="checkbox.isSelected" :label="label(checkbox)" density="compact" hide-details class="py-0"/>
         <v-icon v-if="checkbox.isParent" :icon="icon(checkbox)" @click="toggleExpand(checkbox.id)" 
            size="small" class="menu-icon ml-1"/>                           
      </div>
   </v-col>           
</template>

<script setup>
   import { computed, ref } from 'vue'
   import ToolTipHover from '@/components/util/ToolTipHover.vue'
    
   const props = defineProps({ checkboxes: Array, maxChars: Number })
   const expandedCheckboxIds = ref(new Set())

   const isAbbrev = (checkbox) => { return checkbox.name.length > props.maxChars }
   const label = (checkbox) => { return isAbbrev(checkbox) ? checkbox.name.substr(0, props.maxChars) + "..." : checkbox.name }
   const icon = (checkbox) => { 
      return expandedCheckboxIds.value.has(checkbox.id) ? "mdi-chevron-down-circle" : "mdi-chevron-right-circle" }

   const allCheckboxes = computed(() => {
      const checkboxes = []
      for (const checkbox of props.checkboxes) {
         checkboxes.push(checkbox)
         for (const descendant of getDescendants(checkbox)) { 
            checkboxes.push(descendant)
         }
      }
      return checkboxes
   })

   const visibleCheckboxes = computed(() => allCheckboxes.value.filter(checkbox => isVisible(checkbox)))

   // recursive
   const getDescendants = (checkbox) => { 
      const descendants = []
      for (const child of checkbox.children) {
         descendants.push(child)
         if (child.children.length) { descendants.push(...getDescendants(child)) }
      }
      return descendants
   }

   const isVisible = (checkbox) => { 
      return checkbox.isSelected || 
             !checkbox.parentId || 
             expandedCheckboxIds.value.has(checkbox.parentId)
   }

   const toggleExpand = (id) => { 
      // have to replace the Set to drive re-evaluation of computed value
      const expandedIds = new Set(expandedCheckboxIds.value)
      if (expandedIds.has(id)) { expandedIds.delete(id) }
      else { expandedIds.add(id) } 
      expandedCheckboxIds.value = expandedIds
   }
</script>

