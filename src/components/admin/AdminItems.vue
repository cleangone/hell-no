<template>
   <div v-if="userId" class="text-left">
      <div v-if="selectedItemIds.length">
         <TextButton @click="editItems()"     text="Edit Selected"/>
         <TextButton @click="bulkEditItems()" text="Bulk Edit"/>
      </div>
      <div v-else>
         <TextButton @click="showAddDialog=true"        text="Add Item"/>
         <TextButton @click="showBulkUploadDialog=true" text="Bulk Upload"/>
      </div>
      <div>
         <v-row>
            <v-col cols="5">
               <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
                  flat hide-details variant="solo-filled" density="compact" style="height: 100%"/>
            </v-col>
            <v-col>
               <v-select v-model="computedHeaders" :items="headerOptions" label="Columns" 
                  item-title="title" return-object multiple class="text-subtitle-2"/>
            </v-col>
         </v-row>
         <v-data-table v-if="props.userId" v-model="selectedItemIds" :headers="displayHeaders" :items="userItems" 
            :custom-key-sort="customKeySort" :search="search" item-key="id" density="compact" 
            show-select items-per-page="25">
            <template v-slot:item.artist="{ item }">
               {{ item.primaryArtist.fullName }}
            </template>
            <template v-slot:item.dateCreated="{ item }">{{ defaultDisplayDate(item.dateCreated) }}</template>
            <template v-slot:item.dateModified="{ item }">{{ defaultDisplayDate(item.dateModified) }}</template>
            <template v-slot:item.dateContentModified="{ item }">
               {{ defaultDisplayDate(item.dateContentModified) }}
               <EditButton @click="editContentModified(item)"/>
            </template>
            <template v-slot:item.images="{ item }">
               <span style="min-width:90px" class="d-flex justify-center align-center">
                  <TableThumb :item="item" imageCount/>
               </span>
            </template>
            <template v-slot:item.actions="{ item }">
               <EditButton @click="editItem(item)"/>
               <DeleteButton @click="deleteItem(item)" :disabled="isChildItem(item.id)"/>
            </template>
         </v-data-table>
      </div>
   </div>
   
   <v-dialog v-model="showAddDialog" width="auto">
      <AddItemDialog :userId="userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showBulkUploadDialog" width="auto">
      <BulkUpload  :userId="userId" @done="showBulkUploadDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto" height="auto">
      <EditItemDialog :item="selectedItem" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditContentModifiedDialog" width="auto" height="auto">
      <EditItemContentModified :item="selectedItem" @done="showEditContentModifiedDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditSelectedDialog" width="auto">
      <EditItemDialog :items="selectedItems" @done="editSelectedDone()"/>
   </v-dialog>
   <v-dialog v-model="showBulkEditDialog" width="auto">
      <BulkEditItems :items="selectedItems" @done="bulkEditDone()"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteItem :item="selectedItem" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGroupStore }   from '@/stores/groupStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import EditItemContentModified from '@/components/admin/EditItemContentModified.vue'
   import TableThumb     from '@/components/account/TableThumb.vue'
   import AddItemDialog  from '@/components/item/crud/AddItemDialog.vue'
   import BulkUpload     from '@/components/item/crud/BulkUpload.vue'
   import EditItemDialog from '@/components/item/crud/EditItemDialog.vue'
   import BulkEditItems  from '@/components/item/crud/BulkEditItems.vue'
   import DeleteItem     from '@/components/item/crud/DeleteItem.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import { defaultDisplayDate } from '@/utils/dateUtils'

   const props = defineProps({ userId: String })
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const groupStore   = useGroupStore()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const selectedItem = ref({})
   const selectedItemIds = ref([])
   const selectedItems = ref([])
   const search = ref("")
   const showAddDialog          = ref(false)   
   const showBulkUploadDialog   = ref(false)   
   const showEditDialog         = ref(false)   
   const showEditContentModifiedDialog = ref(false)   
   const showEditSelectedDialog = ref(false)   
   const showBulkEditDialog     = ref(false)   
   const showDeleteDialog       = ref(false)   
   
   const Headers = {
      NAME:       {        title:'Name',        key:'name',          value: 'name' },
      IMAGES:     { col:1, title:'Images',      key:'images',                               align:'center' },
      ARTIST:     { col:2, title:'Artist',      key:'artist',        value: 'primaryArtist.sortName' },
      CREATED:    { col:3, title:'Created',     key:'dateCreated',   value: 'dateCreated',  align: 'center' },
      MODIFIED:   { col:4, title:'Modified',    key:'dateModified',  value: 'dateModified', align: 'center' },
      CONTENT_MOD:{ col:5, title:'Content Modified', key:'dateContentModified',value: 'dateContentModified', align: 'center' },
      TYPE:       { col:6, title:'Type',                             value: 'type',         align: 'center' },
      YEAR:       { col:7, title:'Year',        key:'yearCreated',   value: 'yearCreated',  align: 'center' },
      VISIBILITY: { col:8, title:'Visibility',  key:'state',         value: 'state',        align: 'center' },
      GROUPS:     { col:9, title:'Groups',                           value: 'groups' },
      GALLERIES:  { col:10,title:'Galleries',                        value: 'galleries' },
      ACTIONS:    {        title:'',            key:'actions' },
   }

   const customKeySort = {
      hits:          (a, b) => { return b - a }, 
      name:          (a, b) => { return a.localeCompare(b) }, 
      artist:        (a, b) => { return a.localeCompare(b) }, 
      dateCreated:   (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }, 
      dateContentModified: (a, b) => { return b - a }, 
      yearCreated:   (a, b) => { return safeCompare(a, b) }, 
      state:         (a, b) => { return a.localeCompare(b) }, 
   } 

   const safeCompare = (a, b) => { 
      if (a && b) { return a.localeCompare(b) }
      else if (a) { return 1 }
      return -1
    }

   const headerOptions = [ Headers.IMAGES, Headers.ARTIST, Headers.CREATED, Headers.MODIFIED, Headers.CONTENT_MOD, 
                           Headers.YEAR, Headers.TYPE, Headers.VISIBILITY, Headers.GROUPS, Headers.GALLERIES ]
   const selectedHeaders = ref([ Headers.IMAGES, Headers.ARTIST, Headers.CONTENT_MOD, Headers.VISIBILITY ])
   
   onMounted(async() => {
      if (viewStore.adminItemHeaders) { selectedHeaders.value = [...viewStore.adminItemHeaders] }
   })
   
   const computedHeaders = computed({ 
      get() { return selectedHeaders.value },
      set(updatedHeaders) {
         const headers = [ ...updatedHeaders ]
         headers.sort(function(a, b) {return a.col - b.col})   
         viewStore.setAdminItemHeaders(headers)
         selectedHeaders.value = [ ...headers ]
      }
   })

   const displayHeaders = computed(() => { 
      const selected = [ ...selectedHeaders.value ]
      const headers = []
      headers.push(Headers.NAME)
      headers.push(...selected)
      headers.push(Headers.ACTIONS) 
      return headers
   })

   const allUserItems = computed(() => { 
      if (props.userId) {
         const items = []
         for (const item of itemStore.getUserItems(props.userId)) {
            items.push(item)
         }
         return items
      }
      return []
   })

   const userItems = computed(() => { 
      const displayItems = []
      if (itemStore.myItems) {
         for (const item of allUserItems.value) {
               const displayItem = { ...item }

               // need to search and sort on same value
               displayItem.primaryArtist = item.primaryArtist ? 
                  { ...item.primaryArtist, sortName: item.primaryArtist.name + " " + item.primaryArtist.fullName} :
                  { fullName: "", sortName: "" }
               
               displayItem.imageCount = (item.primaryImage ? 1 : 0) + item.otherImages.length

               if (item.groupIds) { 
                  const groupNames = []
                  for (const groupId of item.groupIds) { 
                     if (groupIdToGroup.value.has(groupId)) { groupNames.push(groupIdToGroup.value.get(groupId).name)  }
                  }
                  displayItem.groups = groupNames.join(', ') 
               }

               const galleryNames = []
               if (item.galleryIds) { 
                  for (const galleryId of item.galleryIds) { 
                     const gallery = galleryStore.getGallery(galleryId)
                     galleryNames.push(gallery ? gallery.name : "Unknown")
                  }
               }
               displayItem.galleries = galleryNames.join(', ')
               displayItems.push(displayItem)
         }
      }

      displayItems.sort(function(a, b) {return b.dateModified - a.dateModified}) // most recent modified first
      return displayItems
   })

   const isChildItem = (itemId) => { return itemStore.childItemIds.has(itemId) }
   const groupIdToGroup = computed(() => { return groupStore.getUserGroupsMap(props.userId) })
   
   const editContentModified = (item) => { showItemDialog(item, showEditContentModifiedDialog) }
   const editItem            = (item) => { showItemDialog(item, showEditDialog) }
   const deleteItem          = (item) => { showItemDialog(item, showDeleteDialog) }
   const showItemDialog = (item, showDialog) => {
      selectedItem.value = item
      showDialog.value = true
   }

   const editItems     = () => { showItemsDialog(showEditSelectedDialog) }
   const bulkEditItems = () => { showItemsDialog(showBulkEditDialog) }
   const showItemsDialog = (showDialog) => {
      selectedItems.value = []
      for (const item of userItems.value) {
         if (selectedItemIds.value.includes(item.id)) { selectedItems.value.push(item) }
      }
      showDialog.value = true
   }

   const editSelectedDone = () => { selectedItemsActionDone(showEditSelectedDialog) }
   const bulkEditDone     = () => { selectedItemsActionDone(showBulkEditDialog) }
   const selectedItemsActionDone = (showDialog) => {
      showDialog.value = false
      selectedItemIds.value = []
   }
</script>

<style>
.select-min {
  min-width: 35%;
}
</style>
