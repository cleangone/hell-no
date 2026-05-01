<template>
   <div class="text-left">
      <v-row class="ms-2 text-left text-h6 align-center">
         <v-col class="flex-grow-1 flex-shrink-0 align-center">
            Items
            <span v-if="selectedItemIds.length">
               <TextButton v-if="canGroupSelectedItems" @click="groupItems()" text="Group Items"/>
               <TextButton @click="editItems()"     text="Edit Selected"/>
               <TextButton @click="bulkEditItems()" text="Bulk Edit"/>
               <TextButton @click="deleteItems()"   text="Delete Selected"/>
            </span>
            <span v-else>
               <TextButton @click="showAddDialog=true"               text="Add Item"/>
               <TextButton @click="showBulkUploadDialog=true"        text="Bulk Upload"/>
               <TextButton v-if="showTable" @click="showTable=false" text="View Thumbnails"/>
               <TextButton v-else @click="showTable=true"            text="View Table"/>
            </span>
         </v-col> 
      </v-row>
      <v-row class="ms-2 text-left align-start" dense style="max-height: 45px;" >
         <v-col class="flex-grow-1 flex-shrink-0 ps-3 py-0">
            <v-switch v-model="showHiddenItems" :value="true" label="Show Hidden Items" color="primary"></v-switch>
         </v-col>
         <v-col class="me-5 flex-grow-0 flex-shrink-0 gallery-min text-subtitle-2 py-0">
            <v-select v-model="selectedGalleryId" label="Gallery" :items="galleryOptions" clearable density="compact"></v-select>
         </v-col>   
      </v-row>
      <div v-if="showTable">
         <v-card flat>
            <v-card-title class="d-flex">
               <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
                 flat hide-details variant="solo-filled" density="compact"
                 class="flex-grow-1 flex-shrink-0"></v-text-field>
               <v-select v-model="computedHeaders" :items="headerOptions" label="Columns" 
                  item-title="title" return-object multiple 
                  class="ms-5 flex-grow-0 flex-shrink-1 select-min text-subtitle-2"></v-select>
            </v-card-title>
         </v-card>
         <v-data-table v-model="selectedItemIds" :headers="displayHeaders" :items="userItems" 
            :custom-key-sort="customKeySort" :search="search" item-key="id" density="compact" 
            show-select items-per-page="25">
            <template v-slot:item.artist="{ item }">
               {{ item.primaryArtist.fullName }}
            </template>
            <template v-slot:item.dateCreated="{ item }">
               {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
            </template>
            <template v-slot:item.dateModified="{ item }">
               {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
            </template>
            <template v-slot:item.dateContentModified="{ item }">
               {{ item.dateContentModified ? item.dateContentModified.toDate().toLocaleDateString() : "" }}
            </template>
            <template v-slot:item.images="{ item }">
               <span style="min-width:90px" class="d-flex justify-center align-center">
                  <TableThumb :item="item" @select="thumbClicked" imageCount pointer/>
               </span>
            </template>
            <template v-slot:item.actions="{ item }">
               <EditButton @click="editItem(item)"/>
               <DeleteButton @click="deleteItem(item)" :disabled="isChildItem(item.id)"/>
            </template>
         </v-data-table>
      </div>
      <v-container v-else>
         <v-row justify="space-around" class="" >
            <ItemThumb v-for="item in userItems" :key="item.id" :item="item" :origin="ItemOrigin.ADMIN" :admin="true" /> 
         </v-row>
      </v-container>
   </div>
   
   <v-dialog v-model="showAddDialog" width="auto">
      <AddItemDialog :gallery="selectedGallery" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showBulkUploadDialog" width="auto">
      <BulkUpload @done="showBulkUploadDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto" height="auto">
      <EditItemDialog :item="selectedItem" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showCreateGroupDialog" width="auto">
      <GroupItems :items="selectedItems" :gallery="selectedGallery" @done="createGroupDone()"/>
   </v-dialog>
   <v-dialog v-model="showEditSelectedDialog" width="auto">
      <EditItemDialog :items="selectedItems" @done="editSelectedDone()"/>
   </v-dialog>
   <v-dialog v-model="showBulkEditDialog" width="auto">
      <BulkEditItems :items="selectedItems" @done="bulkEditDone()"/>
   </v-dialog>
   <v-dialog v-model="showEditImagesDialog" width="auto">
      <EditImages :item="selectedItem" @done="showEditImagesDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditGroupItemsDialog" width="auto">
      <EditGroupItems :item="selectedItem" @done="showEditGroupItemsDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteItem :item="selectedItem" @done="showDeleteDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteSelectedDialog" width="auto">
      <DeleteItem :items="selectedItems" @done="showDeleteSelectedDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGroupStore }   from '@/stores/groupStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useHitStore }     from '@/stores/hitStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import TableThumb     from '@/components/account/TableThumb.vue'
   import AddItemDialog  from '@/components/item/crud/AddItemDialog.vue'
   import BulkUpload     from '@/components/item/crud/BulkUpload.vue'
   import EditItemDialog from '@/components/item/crud/EditItemDialog.vue'
   import GroupItems     from '@/components/item/crud/GroupItems.vue'
   import EditImages     from '@/components/item/crud/EditImages.vue'
   import EditGroupItems from '@/components/item/crud/EditGroupItems.vue'
   import BulkEditItems  from '@/components/item/crud/BulkEditItems.vue'
   import DeleteItem     from '@/components/item/crud/DeleteItem.vue'
   import ItemThumb      from '@/components/item/thumb/ItemThumb.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import { isHidden } from '@/utils/utils'
   import { ItemOrigin, ItemType, Route } from '@/utils/constants'
   
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const groupStore   = useGroupStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const hitStore     = useHitStore()
   const profileStore = useProfileStore()
   const viewStore    = useViewStore()
   const showTable = ref(true)
   const showAddDialog            = ref(false)
   const showBulkUploadDialog     = ref(false)
   const showEditDialog           = ref(false)
   const showCreateGroupDialog    = ref(false)
   const showEditSelectedDialog   = ref(false)
   const showBulkEditDialog       = ref(false)
   const showEditImagesDialog     = ref(false)
   const showEditGroupItemsDialog = ref(false)
   const showDeleteDialog         = ref(false)
   const showDeleteSelectedDialog = ref(false)
   const selectedItem = ref({})
   const selectedItemIds = ref([])
   const selectedItems = ref([])
   const search = ref("")

   const Headers = {
      NAME:       {        title:'Name',        key:'name',          value: 'name' },
      HITS:       { col:0, title:'Hits',        key:'hits',          value: 'hits',         align:'center' },
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
      PROFILE:    { col:11,title:'Profile',                          value: 'profile' },
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

   const headerOptions = [ Headers.HITS, Headers.IMAGES, Headers.ARTIST, Headers.CREATED, Headers.MODIFIED, Headers.CONTENT_MOD, 
                           Headers.YEAR, Headers.TYPE, Headers.VISIBILITY, Headers.GROUPS, Headers.GALLERIES, Headers.PROFILE ]
   const selectedHeaders = ref([ Headers.HITS, Headers.IMAGES, Headers.ARTIST, Headers.VISIBILITY, Headers.GROUPS, Headers.GALLERIES ])
   
   onMounted(async() => {
      if (userStore.mySettings.itemHeaders) { selectedHeaders.value = [...userStore.mySettings.itemHeaders] }
   })
   
   const computedHeaders = computed({ 
      get() { return selectedHeaders.value },
      set(updatedHeaders) {
         const headers = [ ...updatedHeaders ]
         headers.sort(function(a, b) {return a.col - b.col})   
         userMgr.setItemHeaders(headers)
         selectedHeaders.value = [ ...headers ]
      }
   })

   const displayHeaders = computed(() => { 
      const selected = [ ...selectedHeaders.value ]
      const headers = []
      if (selected.length && selected[0].title == Headers.HITS.title) { 
         selected.splice(0, 1)
         headers.push(Headers.HITS) 
      }
      headers.push(Headers.NAME)
      headers.push(...selected)
      headers.push(Headers.ACTIONS) 
      return headers
   })
   
   const showHiddenItems = computed({ 
      get() { return userStore.mySettings.showHiddenItems ? userStore.mySettings.showHiddenItems : false },
      set(showHidden) { userMgr.setShowHiddenItems(showHidden) }
   })

   const galleryOptions = computed(() => galleryMgr.myGalleryOptions)
   const selectedGalleryId = computed({ 
      get() { return viewStore.accountGalleryId },
      set(galleryId) { 
         selectedItemIds.value = []
         viewStore.setAccountGalleryId(galleryId) 
      }
   })

   const selectedGallery = computed(() => {
      return selectedGalleryId.value ? galleryStore.myGalleryIdToGalleryMap.get(selectedGalleryId.value) : null 
   })
   
   const allUserItems = computed(() => { 
      if (selectedGalleryId.value) {
         const items = []
         for (const item of itemStore.myItems) {
            if (item.galleryIds.includes(selectedGalleryId.value)) { items.push(item) }
         }
         return items
      }
      else { return itemStore.myItems }
   })

   const userItems = computed(() => { 
      const displayItems = []
      if (itemStore.myItems) {
         for (const item of allUserItems.value) {
            if (showHiddenItems.value || !isHidden(item)) {
               const displayItem = { ...item }

               const hit = hitStore.getHit(item.id)
               displayItem.hits = hit ? hit.views : ""

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
                     if (galleryStore.myGalleryIdToGalleryMap.has(galleryId)) { 
                        galleryNames.push(galleryStore.myGalleryIdToGalleryMap.get(galleryId).name)  
                     }
                     else  { galleryNames.push("Unknown") }
                  }
               }
               displayItem.galleries = galleryNames.join(', ')

               if (item.profileId) { displayItem.profile = profileStore.getUsername(item.profileId) }

               displayItems.push(displayItem)
            }
         }
      }

      displayItems.sort(function(a, b) {return b.dateModified - a.dateModified}) // most recent modified first
      return viewStore.setVisibleItems(ItemOrigin.ADMIN, "Admin", Route.USER.url, displayItems)
   })

   const groupIdToGroup = computed(() => { return groupStore.getUserGroupsMap(userStore.userId) })
   const isItemGroup = (item) => { return itemMgr.isItemGroup(item)  }
   const canGroupSelectedItems = computed(() => { 
      for (const item of allUserItems.value) {
         if (selectedItemIds.value.includes(item.id) && item.type == ItemType.GROUP) { return false }
      }
      return true
   })

   const isChildItem = (itemId) => { return itemStore.myChildItemIds.has(itemId) }

   const thumbClicked   = (item) => { isItemGroup(item) ? editGroupItems(item) : editImages(item) }
   const editItem       = (item) => { showItemDialog(item, showEditDialog) }
   const editImages     = (item) => { showItemDialog(item, showEditImagesDialog) }
   const editGroupItems = (item) => { showItemDialog(item, showEditGroupItemsDialog) }
   const deleteItem     = (item) => { showItemDialog(item, showDeleteDialog) }
   const showItemDialog = (item, showDialog) => {
      selectedItem.value = item
      showDialog.value = true
   }

   const groupItems    = () => { showItemsDialog(showCreateGroupDialog) }
   const editItems     = () => { showItemsDialog(showEditSelectedDialog) }
   const deleteItems   = () => { showItemsDialog(showDeleteSelectedDialog) }
   const bulkEditItems = () => { showItemsDialog(showBulkEditDialog) }
   const showItemsDialog = (showDialog) => {
      selectedItems.value = []
      for (const item of userItems.value) {
         if (selectedItemIds.value.includes(item.id)) { selectedItems.value.push(item) }
      }
      showDialog.value = true
   }

   const editSelectedDone = () => { selectedItemsActionDone(showEditSelectedDialog) }
   const createGroupDone  = () => { selectedItemsActionDone(showCreateGroupDialog) }
   const bulkEditDone     = () => { selectedItemsActionDone(showBulkEditDialog) }
   const selectedItemsActionDone = (showDialog) => {
      showDialog.value = false
      selectedItemIds.value = []
   }
</script>

<style>
.gallery-min {
  min-width: 25%;
}
.select-min {
  min-width: 35%;
}

.red {
   background-color: red;
}
.green {
   background-color: greenyellow;
}

.main {
  display: flex;
  flex-wrap: wrap;
}
.card {
   display: inline-block;
}
</style>
