<template>
   <v-card :title="title" class="edit-dialog">
      <v-form class="mt-2">
         <v-select v-if="isAdmin" v-model="displayOrder" label="Display Order" :items="displayOrders" class="mx-3"></v-select>
         <span v-if="isAdmin" class="font-weight-medium ml-4">Rows 
            <IconButton icon="mdi-minus" :disabled="!canDeleteRow" @click="deleteRow()"/>
            {{ wallRows }}
            <IconButton icon="mdi-plus" @click="addRow()"/>
         </span>
         <v-text-field v-model="maxWallItems" label="Max Items" type="number" class="number-field ml-4" />
         <v-checkbox v-model="addRecent" label="Add Recent Items" class="mx-2"/>
      </v-form> 
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useWallStore }  from '@/stores/wallStore'
   import { useWallMgr }    from '@/stores/wallMgr'
   import { useAdminStore } from '@/stores/adminStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { Defaults, Emit, WallDisplayOrder } from '@/utils/constants'  
   
   const props = defineProps({ wall: Object, asAdmin: Boolean })
   const emit = defineEmits([Emit.DONE])

   const wallStore  = useWallStore()
   const wallMgr    = useWallMgr()
   const adminStore = useAdminStore()
   const displayOrders = [ WallDisplayOrder.USER_SET, WallDisplayOrder.RANDOM, WallDisplayOrder.RANDOM_IN_ROW ]
   const displayOrder = ref('')
   const wallRows = ref(0)
   const maxWallItems = ref(Defaults.MAX_WALL_ITEMS)
   const addRecent = ref(false)
   
   onMounted(() => {
      displayOrder.value = props.wall.displayOrder ? props.wall.displayOrder : WallDisplayOrder.RANDOM
      wallRows.value = props.wall.wallRows 
      addRecent.value = props.wall.addRecent 
      if (props.wall.maxWallItems) { maxWallItems.value = props.wall.maxWallItems }
   })
   
   const title = computed(() => "Edit Wall" + (isAdmin.value ? " - " + wallMgr.name(props.wall) : ""))   
   const isAdmin = computed(() => props.asAdmin && adminStore.isAdmin)   
   const addRow = () => { wallRows.value++ }
   const canDeleteRow = computed(() => wallRows.value && wallRows.value > maxWallItemRow.value)
   const deleteRow = () => { if (canDeleteRow) { wallRows.value-- } }

   const maxWallItemRow = computed(() => { 
      let maxRow = 0
      for (const wallItem of props.wall.wallItems) { 
         if (wallItem.wallRow && wallItem.wallRow > maxRow) { maxRow = wallItem.wallRow }    
      }
      return maxRow
   })

   const save = () => {
      wallStore.updateWall({
         id: props.wall.id,
         displayOrder: displayOrder.value,
         wallRows: wallRows.value,
         maxWallItems: maxWallItems.value,
         addRecent: addRecent.value
      }) 
      emit(Emit.DONE)
   }
</script>

<style>
</style>
