<template>
   <div>
      <v-row no-gutters class="d-flex align-left flex-nowrap">
         <v-col class="text-h6 flex-grow-1 flex-shrink-0">
            <a @click="$emit(Emit.DONE)" class="admin-link">{{ isMyGallery ? "Galleries": "My ContributingGalleries" }}</a> > {{ gallery.name }}
            <EditButton v-if="isMyGallery" @click="showEditGalleryDialog=true" class="admin-link"/>
            <TextButton v-if="!selectedItemIds.length" @click="showAddItemDialog=true" text="Add Item"/>
            <TextButton v-if="isMyGallery && !selectedItemIds.length" @click="showBulkUpload=true"     text="Bulk Upload"/>
            <TextButton v-if="isMyGallery && !selectedItemIds.length" @click="showManifestUpload=true" text="Manifest Upload"/>
            <TextButton v-if="selectedItemIds.length" @click="editItems()"     text="Edit Selected"/>
            <TextButton v-if="selectedItemIds.length" @click="bulkEditItems()" text="Bulk Edit"/>
            <TextButton v-if="selectedItemIds.length" @click="groupItems()"    text="Group Items"/>
            <TextButton v-if="viewTable" @click="viewTable=false" text="View Thumbnails"/>
            <TextButton v-else           @click="viewTable=true"  text="View Table"/>
         </v-col>
         <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 justify-end align-center">
            <IconButton v-if="!viewTable" icon="mdi-image-size-select-large" @click="isSmallThumb=!isSmallThumb" size="med"/> 
         </v-col>
      </v-row>

      <v-data-table v-if="viewTable" v-model="selectedItemIds" :headers="itemHeaders" 
            :items="galleryDisplayItems" item-key="id" items-per-page="100" 
            :custom-key-sort="customKeySort" @update:currentItems="setSortedItems"
            :show-select="isMyGallery" :item-selectable="item => item.isMyItem">
         <template v-slot:header.position="{ column, getSortIcon, toggleSort }">
            <div class="d-flex align-center">
               <v-icon :icon="getSortIcon(column)" class="v-data-table-header__sort-icon ml-1" />
               <ToolTipHover v-if="itemsSorted" text="Save the new sort order" v-slot="{ props }">
                  <IconButton v-bind="props" icon="mdi-database" @click="saveSortOrder()" @click.stop class="admin-link"/>
               </ToolTipHover>
            </div>
         </template>
         <template v-slot:item.position="{ item }">
            <div v-if="!isHidden(item)">{{ item.position }}</div>
         </template>
         <template v-slot:item.image="{ item }">
            <span style="min-width:90px" class="d-flex justify-center align-center">
               <TableThumb :item="item"/>
            </span>
         </template>
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton v-if="isMyGallery || item.isMyItem" @click="editItem(item)" class="admin-link"/>
            <IconButton v-if="isMyGallery || item.isMyItem" icon="mdi-folder-remove" @click="removeItemFromGallery(item)" 
               :disabled="isChildItem(item.id)" class="admin-link"/>
         </template>
      </v-data-table>
      <div v-else class="ma-4">
         <draggable v-model="galleryThumbItems" item-key="id" class="main">
            <template #item="{element}">
               <v-card :width="thumbWidth(element)" class="mx-2 my-1 mcard bg-grey-lighten-4">
                  <v-card-text class="text-center my-0 py-0">
                    <v-icon icon="mdi-drag" color="blue-darken-2" class="justify-center"></v-icon>
                  </v-card-text>
                  <v-row v-if="isItemGroup(element)" no-gutters class="d-flex justify-center">
                     <img v-for="childItem in element.childItems" :key="childItem.id" 
                        :src="childItem.primaryImage.thumbUrl" :height="thumbHeight"/>
                  </v-row>
                  <v-img v-else :src="element.primaryImage.thumbUrl" class="pa-1"></v-img>
                  <v-card-text :class="textClass" class="pa-0 text-center">{{ element.name }}</v-card-text>
               </v-card>
            </template>
         </draggable>
      </div>
   </div>

   <v-dialog v-model="showEditGalleryDialog" width="auto">
      <EditGalleryCard :gallery="gallery" @done="showEditGalleryDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showAddItemDialog" width="auto">
      <AddItemDialog :gallery="gallery"  @done="showAddItemDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showBulkUpload" width="auto">
      <BulkUpload :gallery="gallery" @done="showBulkUpload=false"/>
   </v-dialog>
    <v-dialog v-model="showManifestUpload" width="auto">
      <ManifestUpload :gallery="gallery" @done="showManifestUpload=false"/>
   </v-dialog>
   <v-dialog v-model="showEditItemDialog" width="auto">
      <EditItemDialog :item="selectedItem" @done="showEditItemDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditItemsDialog" width="auto">
      <EditItemDialog :items="selectedItems" @done="showEditItemsDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showBulkEditDialog" width="auto">
      <BulkEditItems :items="selectedItems" @done="showBulkEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showGroupItemsDialog" width="auto">
      <GroupItems :items="selectedItems" :gallery="gallery"  @done="showGroupItemsDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showRemoveItemDialog" max-width="500px">
      <RemoveItem :item="selectedItem" :gallery="gallery" @done="showRemoveItemDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import draggable from 'vuedraggable'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import TableThumb      from '@/components/account/TableThumb.vue'
   import EditGalleryCard from '@/components/gallery/EditGalleryCard.vue'
   import RemoveItem      from '@/components/gallery/RemoveItem.vue'
   import AddItemDialog   from '@/components/item/crud/AddItemDialog.vue'
   import BulkUpload      from '@/components/item/crud/BulkUpload.vue'
   import ManifestUpload  from '@/components/item/crud/ManifestUpload.vue'
   import EditItemDialog  from '@/components/item/crud/EditItemDialog.vue'
   import BulkEditItems   from '@/components/item/crud/BulkEditItems.vue'
   import GroupItems      from '@/components/item/crud/GroupItems.vue'
   import EditButton      from '@/components/util/EditButton.vue'
   import IconButton      from '@/components/util/IconButton.vue'
   import TextButton      from '@/components/util/TextButton.vue'
   import ToolTipHover    from '@/components/util/ToolTipHover.vue'
   import { isHidden } from '@/utils/utils'
   import { Defaults, Emit, ItemOrigin, Route } from '@/utils/constants'
   
   const THUMB_HEIGHT    = 200
   const THUMB_HEIGHT_SM = 125

   const props = defineProps(['galleryId'])
   const emit = defineEmits([Emit.DONE])
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const viewStore    = useViewStore()
   const showEditGalleryDialog = ref(false)
   const showAddItemDialog     = ref(false)
   const showBulkUpload        = ref(false)
   const showManifestUpload    = ref(false)
   const showEditItemDialog    = ref(false)
   const showEditItemsDialog   = ref(false)
   const showGroupItemsDialog  = ref(false)
   const showBulkEditDialog    = ref(false)
   const showRemoveItemDialog  = ref(false)
   const viewTable = ref(true)
   const isSmallThumb = ref(false)
   const sortedItems = ref(null)
   const selectedItem = ref({})
   const selectedItemIds = ref([])
   const selectedItems = ref([])
   const groupedGalleryItemIds = ref([])

    const itemHeaders = computed(() => { 
      const headers = [
         { title: 'ID',      key: 'id',                   align: ' d-none' }, // hide column, keep data
         { title: '',            value: 'position',       align: 'center', sortable: true },
         { title: 'Name',        value: 'name',                            sortable: true },
         { title: 'Image',       value: 'image',          align: 'center' },
         { title: 'Artist',  key: 'primaryArtist', value: 'primaryArtist.fullName' },
         { title: 'Visibility',  value: 'state',          align: 'center' },
         { title: 'Modified',    value: 'dateModified',   align: 'center', sortable: true },
      ]
      if (ownerExists.value) { headers.push({ title: 'Owner', value: 'ownerUsername', align: 'center' })}
      headers.push({ title: '', key: "actions", sortable: false })
      return headers
   })

   const customKeySort = {
      name: (a, b) => { return a.localeCompare(b) }, 
      primaryArtist: (a, b) => { return a.name.localeCompare(b.name) } 
   } 

   const gallery     = computed(() => galleryStore.getGallery(props.galleryId))
   const isMyGallery = computed(() => gallery.value && gallery.value.userId == userStore.userId)
   const galleryDisplayItems = computed(() => { 
      const galleryItemIds = gallery.value.itemIds ? gallery.value.itemIds : []
      const displayItems = []
      for (const item of itemStore.getGalleryItems(props.galleryId)) {
         const displayItem = { ...item, position: galleryItemIds.indexOf(item.id) + 1, isMyItem: item.userId == userStore.userId }
         if (!displayItem.isMyItem) { 
            const owner = userStore.getUser(item.userId)
            if (owner) { displayItem.ownerUsername = owner.username }
         }
         displayItems.push(displayItem) 
      }
      displayItems.sort(function(a, b){return a.position - b.position}) 
      return viewStore.setVisibleItems(ItemOrigin.ADMIN, "Admin", Route.USER.url, displayItems)
   })

   const ownerExists = computed(() => { 
      for (const gallery of galleryDisplayItems.value) {
         if (gallery.ownerUsername) { return true }
      }
      return false
   })

   const setSortedItems = (items) => { sortedItems.value = items }
   const itemsSorted = computed(() => { 
      if (!sortedItems.value ||
          sortedItems.value.length != galleryDisplayItems.value.length) { return false } 

      const equalById = sortedItems.value.every((obj, index) => 
         obj.key === galleryDisplayItems.value[index]?.id)
      return !equalById
   })

   const saveSortOrder = () => { 
      const itemIds = sortedItems.value.map(obj => obj.key)
      galleryStore.updateGallery({ id: props.galleryId, itemIds: itemIds }) 
    }

   // thumb drag/drop reordering 
   const galleryThumbItems = computed({ 
      get() {
         groupedGalleryItemIds.value = []
         const displayItems = []
         for (const displayItem of galleryDisplayItems.value) {
            if (isHidden(displayItem)) { groupedGalleryItemIds.value.push(displayItem.id) }
            else { displayItems.push(displayItem) }
         }
         displayItems.sort(function(a, b){return a.position - b.position}) 
         return viewStore.setVisibleItems(ItemOrigin.ADMIN, "Admin", Route.USER.url, displayItems)
      },
      set(updatedItemArray) {
         // save the itemIds in the new order
         const galleryItemIds = updatedItemArray.map(a => a.id)
         galleryItemIds.push( ...groupedGalleryItemIds.value )
         galleryStore.updateGallery({
            id: props.galleryId,
            itemIds: galleryItemIds
         })

         sortedItems.value = null // reset so table does not show saveSortOrder icon
      }
   })

   const thumbHeight = computed(() => isSmallThumb.value ? THUMB_HEIGHT_SM : THUMB_HEIGHT)
   const textClass   = computed(() => isSmallThumb.value ? "text-body-small" : "font-weight-bold")
   
   const isItemGroup = (item) => { return itemMgr.isItemGroup(item)  }
   const thumbWidth  = (item) => { 
      if (isItemGroup(item)) { return groupWidth(item) }

      const aspectRatio = itemMgr.itemAspectRatio(item)
      const targetWidth = Math.round(thumbHeight.value * aspectRatio)
      return targetWidth > Defaults.MAX_THUMB_SIDE ? Defaults.MAX_THUMB_SIDE : targetWidth
   }

   const groupWidth = (item) => { 
      let totalWidth = 0
      let totalHeight = 0
      for (const childItem of item.childItems) {
         totalWidth += childItem.primaryImage.dimensions.width
         totalHeight += childItem.primaryImage.dimensions.height
      }
      const avgHeight = totalHeight/item.childItems.length
      const aspectRatio = totalWidth / avgHeight
      const targetWidth = Math.round(thumbHeight.value * aspectRatio)
      return targetWidth.toString()
   }

   const isChildItem = (itemId) => { return itemStore.myChildItemIds.has(itemId) }

   const editItem = (item) => { showItemDialog(item, showEditItemDialog) }
   const removeItemFromGallery = (item) => { showItemDialog(item, showRemoveItemDialog) }   
   const editItems     = () => { showItemsDialog(showEditItemsDialog) }
   const bulkEditItems = () => { showItemsDialog(showBulkEditDialog) }
   const groupItems    = () => { showItemsDialog(showGroupItemsDialog) }
     
   const showItemsDialog = (showDialog) => {
      selectedItems.value = []
      for (const item of galleryDisplayItems.value) {
         if (selectedItemIds.value.includes(item.id)) { selectedItems.value.push(item) }
      }
      showDialog.value = true
   }
   
   const showItemDialog = (item, showDialog) => {
      selectedItem.value = item
      showDialog.value = true
   }
</script>

<style>
.main {
  display: flex;
  flex-wrap: wrap;
}
.card {
   display: inline-block;
}
</style>
