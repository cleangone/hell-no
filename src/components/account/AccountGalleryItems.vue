<template>
   <div class="text-left">
      <div class="text-left text-h6">
         <a @click="$emit(Emit.DONE)">{{ isMyGallery ? "Galleries": "My ContributingGalleries" }}</a> > {{ gallery.name }}
         <EditButton v-if="isMyGallery" @click="showEditGalleryDialog=true"/>
         <TextButton v-if="!selectedItemIds.length" @click="showAddItemDialog=true" text="Add Item"/>
         <TextButton v-if="isMyGallery && !selectedItemIds.length" @click="showBulkUploadDialog=true" text="Bulk Upload"/>
         <TextButton v-if="selectedItemIds.length"  @click="editItems()"     text="Edit Selected"/>
         <TextButton v-if="selectedItemIds.length"  @click="bulkEditItems()" text="Bulk Edit"/>
         <TextButton v-if="selectedItemIds.length"  @click="groupItems()"    text="Group Items"/>
         <TextButton v-if="viewTable" @click="viewTable=false" text="View Thumbnails"/>
         <TextButton v-else           @click="viewTable=true"  text="View Table"/>
      </div>

      <v-data-table v-if="viewTable" v-model="selectedItemIds" :headers="itemHeaders" 
            :items="galleryDisplayItems" item-key="id" :custom-key-sort="customKeySort" 
            :show-select="isMyGallery" :item-selectable="item => item.isMyItem">
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
            <EditButton v-if="isMyGallery || item.isMyItem" @click="editItem(item)"/>
            <IconButton v-if="isMyGallery || item.isMyItem" icon="mdi-folder-remove" @click="removeItemFromGallery(item)" :disabled="isChildItem(item.id)"/>
         </template>
      </v-data-table>

      <div v-else class="ma-4">
         <draggable v-model="galleryThumbItems" item-key="id" class=" main">
            <template #item="{element}">
               <v-card :width="thumbWidth(element)" class="ma-4 card">
                  <v-card-text class="text-center my-0 py-0">
                    <v-icon icon="mdi-drag" color="blue-darken-2" class="justify-center"></v-icon>
                  </v-card-text>

                  <v-row v-if="isItemGroup(element)" class="d-flex justify-center">
                     <img v-for="childItem in element.childItems" :key="childItem.id" 
                        :src="childItem.primaryImage.thumbUrl" height="200"/>
                  </v-row>
                  <v-img v-else :src="element.primaryImage.thumbUrl"></v-img>

                  <v-card-text class="text-center font-weight-bold">{{ element.name }}</v-card-text>
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
   <v-dialog v-model="showBulkUploadDialog" width="auto">
      <BulkUpload :gallery="gallery" @done="showBulkUploadDialog=false"/>
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
   import EditItemDialog  from '@/components/item/crud/EditItemDialog.vue'
   import BulkEditItems   from '@/components/item/crud/BulkEditItems.vue'
   import GroupItems      from '@/components/item/crud/GroupItems.vue'
   import EditButton      from '@/components/util/EditButton.vue'
   import IconButton      from '@/components/util/IconButton.vue'
   import TextButton      from '@/components/util/TextButton.vue'
   import { isHidden } from '@/utils/utils'
   import { Emit, ItemOrigin, URL } from '@/utils/constants'
   
   const THUMB_HEIGHT = 200

   const props = defineProps(['galleryId'])
   const emit = defineEmits([Emit.DONE])
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const viewStore    = useViewStore()
   const showEditGalleryDialog = ref(false)
   const showAddItemDialog     = ref(false)
   const showBulkUploadDialog  = ref(false)
   const showEditItemDialog    = ref(false)
   const showEditItemsDialog   = ref(false)
   const showGroupItemsDialog  = ref(false)
   const showBulkEditDialog    = ref(false)
   const showRemoveItemDialog  = ref(false)
   const viewTable = ref(true)
   const selectedItem = ref({})
   const selectedItemIds = ref([])
   const selectedItems = ref([])
   const groupedGalleryItemIds = ref([])

    const itemHeaders = computed(() => { 
      const headers = [
         { title: '',            value: 'position',       align: 'center', sortable: true },
         { title: 'Name',        value: 'name',                            sortable: true },
         { title: 'Image',       value: 'image',          align: 'center' },
         { title: 'Artist',  key: 'primaryArtist', value: 'primaryArtist.fullName' },
         { title: 'Visibility',  value: 'state',          align: 'center' },
         { title: 'Modified',    value: 'dateModified',   align: 'center', sortable: true },
      ]
      if (ownerExists.value) { headers.push({ title: 'Owner', value: 'ownerUsername', align: 'center' })}
      headers.push({ title: '', key: "actions" })
      return headers
   })

   const customKeySort = {
      name: (a, b) => { return a.localeCompare(b) }, 
      primaryArtist: (a, b) => { return a.name.localeCompare(b.name) } 
   } 

   const gallery = computed(() => { return galleryStore.getGallery(props.galleryId) })
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
      return viewStore.setVisibleItems(ItemOrigin.ADMIN, "Admin", URL.USER, displayItems)
   })

   const ownerExists = computed(() => { 
      for (const gallery of galleryDisplayItems.value) {
         if (gallery.ownerUsername) { return true }
      }
      return false
   })

  const galleryThumbItems = computed({ 
      get() {
         groupedGalleryItemIds.value = []
         const displayItems = []
         for (const displayItem of galleryDisplayItems.value) {
            if (isHidden(displayItem)) { groupedGalleryItemIds.value.push(displayItem.id) }
            else { displayItems.push(displayItem) }
         }
         displayItems.sort(function(a, b){return a.position - b.position}) 
         return viewStore.setVisibleItems(ItemOrigin.ADMIN, "Admin", URL.USER, displayItems)
      },
      set(updatedItemArray) {
         // save the itemIds in the new order
         const galleryItemIds = updatedItemArray.map(a => a.id)
         galleryItemIds.push( ...groupedGalleryItemIds.value )
         galleryStore.updateGallery({
            id: props.galleryId,
            itemIds: galleryItemIds
         })
      }
   })

   const isItemGroup = (item) => { return itemMgr.isItemGroup(item)  }
   
   const thumbWidth = (item) => { 
      if (isItemGroup(item)) { return groupWidth(item) }

      const aspectRatio = itemMgr.itemAspectRatio(item)
      const targetWidth = Math.round(THUMB_HEIGHT * aspectRatio)
      return targetWidth.toString()
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
      const targetWidth = Math.round(THUMB_HEIGHT * aspectRatio)
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
