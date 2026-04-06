<template>
   <v-card title="Group Items" class="edit-dialog" >
      <v-form v-model="dataValid">
         <v-row class="d-flex justify-center ma-5">
            <draggable v-model="dragItems" item-key="id" class=" main">
               <template #item="{element}">
                  <img :src="element.primaryImage.thumbUrl" height="150" class="me-5"/>
               </template>
            </draggable>
         </v-row>
         <div class="justify-center ma-5">
            <span v-for="(item, index) in dragItems" :key="item.id">
               <span v-if="index">, </span>{{ item.name }}
            </span>
         </div>
         <v-row>
            <v-text-field v-model="itemName" label="Item name" :rules="requiredRule" class="mx-5"></v-text-field>
         </v-row>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import draggable from 'vuedraggable'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { dateUuid, requiredRule } from '@/utils/utils'
   import { Emit, ItemType, State } from '@/utils/constants'
   
   const props = defineProps({items: Array, gallery: Object})
   const emit  = defineEmits([Emit.DONE])
   const userStore = useUserStore()
   const itemStore = useItemStore()
   const galleryStore = useGalleryStore()
   const dataValid = ref(true)
   const dragItems = ref([])
   const itemName = ref("")
   const itemPrimaryArtist = ref(null)
   const itemGroupIds = ref(null)
   
   onMounted(() => {
      dragItems.value = [ ...props.items ]

      let primaryArtist = null
      let groupIds = null
      let commonPrimaryArtists = true
      let commonGroupIds = true
      for (const item of props.items) {
         if (!itemName.value.length) { itemName.value = item.name }

         if (primaryArtist == null) { primaryArtist = item.primaryArtist }
         else if (primaryArtist.id != item.primaryArtist.id) { commonPrimaryArtists = false }
         
         if (groupIds == null) { groupIds = [...item.groupIds] }
         else if (!arraysEqual(groupIds, item.groupIds)) { commonGroupIds = false }
      }

      if (commonPrimaryArtists) { itemPrimaryArtist.value = primaryArtist }
      if (commonGroupIds) { itemGroupIds.value = groupIds }
   })

   const arraysEqual = (array1, array2) => { return JSON.stringify(array1) == JSON.stringify(array2) }

   const save = () => {
      const itemId = dateUuid()

      const childItems = []
      for (const item of dragItems.value) {
         childItems.push({
            id: item.id,
            name: item.name,
            primaryImage: item.primaryImage,
            primaryArtist: item.primaryArtist,
            dateModified: item.dateModified,
         })

         itemStore.updateItem({
            id: item.id,
            state: State.HIDDEN
         })
      }

      itemStore.setItem({
         id: itemId,
         name: itemName.value,
         userId: userStore.userId,
         type: ItemType.GROUP,
         childItems: childItems,
         primaryArtist: itemPrimaryArtist.value,
         galleryIds: props.gallery ? [props.gallery.id] : [],
         groupIds: itemGroupIds.value ? itemGroupIds.value : [],
         state: State.PRIVATE,
      })

      if (props.gallery) {
         // add new item at front of gallery
         const itemIds = [itemId]
         if (props.gallery.itemIds ) { itemIds.push(...props.gallery.itemIds) }
            galleryStore.updateGallery({
               id: props.gallery.id,
               itemIds: itemIds,
            })
      }

      emit(Emit.DONE)
   }
</script>

<style>
</style>
