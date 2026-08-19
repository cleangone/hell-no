<template>
   <div class="text-left">
      <v-row class="ms-2 text-h6 d-flex align-center">
         <v-col>
            <a @click="$emit(Emit.DONE)" class="admin-link">Items</a> > Transfer Items
            <ToolTip iconClass="ml-n2">
               To be transferred, an Item must be completely unattached.<br>
               (Not in a Gallery, not on the Wall, not a Group Item, and not a Child Item of a Group)
            </ToolTip> 
         </v-col> 
      </v-row>
      
      <v-card flat class="xfer-search">
         <v-card-title class="d-flex">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
               flat hide-details variant="solo-filled" density="compact" />
         </v-card-title>
      </v-card>
      <v-data-table :headers="headers" :items="displayItems" item-key="id"
            :custom-key-sort="customKeySort" :search="search"  items-per-page="50" density="compact">
         <template v-slot:item.artist="{ item }">
            {{ item.displayArtist.fullName }}
         </template>
         <template v-slot:item.dateCreated="{ item }">
            {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.images="{ item }">
            <span style="min-width:90px" class="d-flex justify-center align-center">
               <TableThumb :item="item" pointer/>
            </span>
         </template>
         <template v-slot:item.actions="{ item }">
            <IconButton icon="mdi-image-move" @click="transferItem(item)"  size="med" class="admin-link"/>
         </template>
      </v-data-table>
   </div>
   
   <v-dialog v-model="showTransferDialog" width="auto" height="auto">
      <TransferItem :item="selectedItem" @done="showTransferDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore } from '@/stores/itemStore'
   import { useWallStore } from '@/stores/wallStore'
   import TableThumb       from '@/components/account/TableThumb.vue'
   import TransferItem     from '@/components/item/TransferItem.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import ToolTip          from '@/components/util/ToolTip.vue'
   import { Emit, ItemType } from '@/utils/constants'
   
   const emit = defineEmits([Emit.DONE])
   
   const itemStore = useItemStore()
   const wallStore = useWallStore()
   const selectedItem = ref({})
   const search = ref("")
   const showTransferDialog = ref(false)
   
   const headers = [
      { title:'Name',        key:'name',          value: 'name' },
      { title:'Image',       key:'images',                               align:'center',  sortable: false },
      { title:'Artist',      key:'artist',        value: 'displayArtist' },
      { title:'Created',     key:'dateCreated',   value: 'dateCreated',  align: 'center' },
      { title: 'Modified',   key:'dateModified',  value: 'dateModified', align: 'center' },
      { title:'',            key:'actions', sortable: false },
   ]

   const customKeySort = {
      name:          (a, b) => { return a.localeCompare(b) }, 
      artist:        (a, b) => { return a.sortName.localeCompare(b.sortName) }, 
      dateCreated:   (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }, 
   } 

   const displayItems = computed(() => { 
      const items = []
      for (const item of itemStore.myItems) {
         if (!item.galleryIds.length && 
             item.type == ItemType.SINGLE && 
             !itemStore.myChildItemIds.has(item.id) &&
             !wallStore.myWallIncludesItem(item.id)) 
         {
            const displayItem = { ...item }

            // need to search and sort on same value
            displayItem.displayArtist = item.primaryArtist ? 
               { fullName: item.primaryArtist.fullName, sortName: item.primaryArtist.name + " " + item.primaryArtist.fullName} :
               { fullName: "", sortName: "" }

            items.push(displayItem)
         }
      }

      items.sort(function(a, b) {return b.dateModified - a.dateModified}) // most recent modified first
      return items
   })

   const transferItem = (item) => {
      selectedItem.value = item
      showTransferDialog.value = true
   }

</script>

<style>
.xfer-search {
  width: 50%;
}
</style>
