<template>
   <v-col>
      <div v-for="chkbox in visibleCheckboxes" :key="chkbox.id" class="d-flex align-center tight-checkbox">
         <v-checkbox v-model="chkbox.isSelected" :label="chkbox.name" density="compact" hide-details class="py-0"/>
         <v-icon v-if="chkbox.isParent" :icon="icon(chkbox)" @click="toggleExpand(chkbox.id)" 
            size="small" class="menu-icon ml-1"/>                           
      </div>
   </v-col>           
</template>

<script setup>
   import { computed, ref } from 'vue'
    
   const props = defineProps({ checkboxes: Array })
   const expandedCheckboxIds = ref(new Set())

   const icon = (chkbox) => { 
      return expandedCheckboxIds.value.has(chkbox.id) ? "mdi-chevron-down-circle" : "mdi-chevron-right-circle" 
   }

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

