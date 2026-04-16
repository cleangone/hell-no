<template>
   <v-form v-model="dataValid">
      <div class="pa-md-4">
         <div v-if="parentGalleryName">Parent Gallery: {{ parentGalleryName  }}</div>
         <v-row>
            <v-col cols="8">
               <v-text-field v-model="galleryName" label="Gallery Name" :rules="requiredRule"/>
            </v-col> 
            <v-col> 
               <v-text-field v-model="galleryTag" label="Tag" :rules="tagRule"/>
            </v-col>
         </v-row>
         <v-row class="mt-n4">
            <v-col>
               <v-select v-model="galleryState" label="Gallery State" :items="GalleryStates"/>
            </v-col> 
            <v-col>
               <v-select v-model="childGalleries" label="Child Galleries" :items="childGalleryOptions" 
                  item-title="name" return-object multiple  v-on:update:modelValue="sortChildGalleries"
                  class="select-min text-subtitle-2"/>
            </v-col>
         </v-row>
         <div class="ms-1">
            <div class="pt-2 pb-1 text-caption text-grey-darken-1">Description</div>
               <EditHtml :contentContainer="galleryDescContainer"/>
         </div>
         <v-checkbox v-model="descInHeader" label="Position description inside bottom of header image" class="ms-n1 mt-n2 tight-checkbox"/> 
         <v-checkbox v-model="useAltItemName" label="Use Item Alternate Name, if set, for Thumbnail" class="ms-n2 mt-2 tight-checkbox"/> 
         <v-checkbox v-model="useLocalItemName" label="Localize Item Name in Thumbnail" class="ms-n2 tight-checkbox"/> 
         <v-row v-if="useLocalItemName" class="mt-3">
            <v-col>
               <v-text-field v-model="itemThumbPrefix" label="Item Thumb Prefix"/>
            </v-col>
            <v-col>
               <v-text-field v-model="itemThumbPrefixReplace" label="Item Thumb Prefix Replace"/>
            </v-col>
         </v-row>
      </div>
   </v-form>
   <div class="float-bottom">  
      <v-btn @click="save()" :disabled="!dataValid" color="primary" class="mr-4">save</v-btn>
      <v-btn @click="$emit(Emit.DONE)" color="primary">cancel</v-btn>
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import EditHtml from '@/components/util/EditHtml.vue'
   import { requiredRule } from '@/utils/utils'
   import { Emit, GalleryStates } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object })
   const emit = defineEmits([ Emit.DONE ])

   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const galleryName = ref('')
   const galleryTag = ref('')
   const galleryState = ref('')
   const galleryDescContainer = ref({ content: "" })
   const descInHeader = ref(false)
   const childGalleries = ref([])
   const itemThumbPrefix = ref('')
   const itemThumbPrefixReplace = ref('')
   const useAltItemName   = ref(false)
   const useLocalItemName = ref(false)
   const dataValid = ref(true)
   
   onMounted(() => {
      galleryName.value  = props.gallery.name
      galleryTag.value   = props.gallery.tag ? props.gallery.tag : ""
      galleryState.value = props.gallery.state
      galleryDescContainer.value.content = props.gallery.desc ? props.gallery.desc : ""
      descInHeader.value     = props.gallery.descInHeader     ? props.gallery.descInHeader     : false
      useAltItemName.value   = props.gallery.useAltItemName   ? props.gallery.useAltItemName   : false
      useLocalItemName.value = props.gallery.useLocalItemName ? props.gallery.useLocalItemName : false
      itemThumbPrefix.value         = props.gallery.itemThumbPrefix        ? props.gallery.itemThumbPrefix : ""
      itemThumbPrefixReplace.value  = props.gallery.itemThumbPrefixReplace ? props.gallery.itemThumbPrefixReplace : ""
      
      for (const gallery of galleryStore.myGalleries) {
         if (props.gallery.childGalleryIds.includes(gallery.id)) { childGalleries.value.push(gallery) }
      }
      sortChildGalleries()
   })
   
   const tagRule = computed(() => [
      v => !v || !v.length || v.length < 16 || 'Max 15 characters',
      v => {         
         const gallery = galleryStore.getGalleryByTag(v)
         return gallery && gallery.id != props.gallery.id ? "Tag already exists" : true 
      }
   ])

   const parentGalleryName = computed(() => galleryStore.getMyGallery(props.gallery.parentGalleryId)?.name )
   
   const sortChildGalleries = () => { childGalleries.value.sort((a, b) => a.name.localeCompare(b.name)) }
   const childGalleryOptions = computed(() => { 
      const galleries = [] 

      // for (const gallery of galleryStore.myGalleries) {
      for (const gallery of galleryMgr.getUserGalleries(props.gallery.userId) ) {
         if (isChildGalleryOption(gallery)) { galleries.push(gallery) }
      }
      return galleries
   })

   const isChildGalleryOption = (gallery) => {
      return (gallery.id == props.gallery.id) || // cannot be your own child
             (props.gallery.parentGalleryId != null && gallery.id == props.gallery.parentGalleryId) || // curr be your parent 
             (gallery.parentGalleryId != null && gallery.parentGalleryId != props.gallery.id) ? // cannot have a diff parent 
         false : true
   }

   const save = () => {
      const childGalleryIds = childGalleries.value.map(function (obj) { return obj.id })
   
      const imagesToAdd = []
      const imagesToRemove = []
      if (JSON.stringify(childGalleryIds) != JSON.stringify(props.gallery.childGalleryIds)) {
         // process child galleries added to list
         for (const newChildId of childGalleryIds) {
            if (!props.gallery.childGalleryIds.includes(newChildId)) { 
                // add parentId to child galleries added to list
               galleryStore.updateGallery({ id: newChildId, parentGalleryId: props.gallery.id }) 

               // add child's images to this gallery
               const newChildGallery = galleryStore.getMyGallery(newChildId)
               if (newChildGallery) { imagesToAdd.push(...newChildGallery.images) }
            }
         }

         // process child galleries removed from list
         for (const exisitingChildId of props.gallery.childGalleryIds) {
            if (!childGalleryIds.includes(exisitingChildId)) { 
               // remove parentId from child gallery
               galleryStore.updateGallery({ id: exisitingChildId, parentGalleryId: null }) 

               // remove child's images to this gallery
               const exisitingChildGallery = galleryStore.getMyGallery(exisitingChildId)
               if (exisitingChildGallery) { imagesToRemove.push(...exisitingChildGallery.images) }
            }
         }
      }

      const imageIdsToRemove = imagesToRemove.map(function (obj) { return obj.id })
      const updatedImages = []
      for (const exisitingImage of props.gallery.images) {
         if (!imageIdsToRemove.includes(exisitingImage.id)) { updatedImages.push(exisitingImage) }
      }
      updatedImages.push(...imagesToAdd)

      galleryStore.updateGallery({
         id: props.gallery.id,
         name:  galleryName.value,
         tag:   galleryTag.value,
         state: galleryState.value,
         desc: galleryDescContainer.value.content,
         descInHeader:     descInHeader.value,
         useAltItemName:   useAltItemName.value,
         useLocalItemName: useLocalItemName.value,
         itemThumbPrefix:  itemThumbPrefix.value,
         itemThumbPrefixReplace: itemThumbPrefixReplace.value,
         images: updatedImages,
         childGalleryIds: childGalleryIds
      })
         
      emit(Emit.DONE)
   }
</script>

<style>
</style>
