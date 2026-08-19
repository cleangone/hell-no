<template>
   <div class="text-left">
      <v-data-table :headers="headers" :items="wallItems" item-key="itemId" items-per-page="25">
         <template v-slot:item.image="{ item }">
            <span style="min-width:90px" class="d-flex justify-center align-center">
               <TableThumb :item="popupItem(item)" pointer/>
            </span>
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton @click="editItem(item)" class="admin-link"></EditButton>
            <DeleteButton @click="deleteWallItem(item)" class="admin-link"></DeleteButton>
         </template>
      </v-data-table>
   </div>
   <v-dialog v-model="showEditWallDialog" width="auto">
      <EditWall :wall="wall" @done="showEditWallDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditWallItemDialog" width="auto">
      <EditWallItem :wallItem="selectedWallItem" :wall="wall" @done="showEditWallItemDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteWallItemDialog" max-width="500px">
      <DeleteWallItem :wallItem="selectedWallItem" :wallId="wall.id" @done="showDeleteWallItemDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWallStore }    from '@/stores/wallStore'
   import TableThumb     from '@/components/account/TableThumb.vue'
   import EditWall       from './crud/EditWall.vue'
   import EditWallItem   from './crud/EditWallItem.vue'
   import DeleteWallItem from './crud/DeleteWallItem.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue' 
   
   const props = defineProps({ wallId: String })
   const wallStore    = useWallStore()
   const showEditWallDialog = ref(false)
   const showEditWallItemDialog = ref(false)
   const showDeleteWallItemDialog = ref(false)
   const selectedWallItem = ref({})

   const headers = computed(() => [
         { title: 'Thumb Text', value: 'title', sortable: true },
         { title: 'Popup Text', value: 'name',  sortable: true },
         { title: 'Profile',    value: 'profile' },
         { title: '',           value: 'image', align: 'center' },
         { title: '', key: 'actions' }
      ]
   )

   const wall = computed(() => wallStore.getWall(props.wallId) )
   const wallItems = computed(() => {
      const items = wall.value ? [ ...wall.value.wallItems ] : []
      items.sort((a, b) => a.title.localeCompare(b.title))
      return items
   })
   
   const popupItem  = (wallItem) => { 
      return { primaryImage: { ...wallItem, dimensions: wallItem.popupDimensions, largeThumbUrl:  wallItem.popupUrl }}
   }

   const editItem = (wallItem) => {
      selectedWallItem.value = wallItem
      showEditWallItemDialog.value = true
   }
   
   const deleteWallItem = (wallItem) => {
      selectedWallItem.value = wallItem
      showDeleteWallItemDialog.value = true
   }
</script>

<style>
</style>
