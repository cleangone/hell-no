<template>
   <v-form v-model="dataValid">
      <div class="pa-md-4">
         <div v-if="parentGalleryName">Parent Gallery: {{ parentGalleryName  }}</div>
         <v-row>
            <v-col cols="8"><v-text-field v-model="galleryName" label="Gallery Name" :rules="requiredRule"/></v-col> 
            <v-col><v-text-field v-model="galleryTag" label="Tag" :rules="tagRule"/></v-col>
         </v-row>
         <v-row class="mt-n4">
            <v-col><v-select v-model="galleryState" label="Gallery State" :items="GalleryStates"/></v-col> 
            <v-col><v-select v-model="galleryProfileId" label="Owned by Profile" :items="profiles" item-title="username" item-value="id" clearable/></v-col>
         </v-row>
         <v-row class="mt-n4 text-subtitle-2">
            <v-col :cols="childGalleryCols">
               <v-select v-model="childGalleries" label="Child Galleries" :items="childGalleryOptions" 
                  item-title="name" return-object multiple v-on:update:modelValue="sortChildGalleries" class="select-min text-subtitle-2"/>
            </v-col>
            <v-col>
               <v-select v-model="galleryContributorIds" label="Contributors" :items="otherUsers"
                  item-title="username" item-value="id" multiple class="select-min text-subtitle-2"/>
            </v-col>
         </v-row>
         <div class="ms-1">
            <div class="pt-2 pb-1 text-caption text-grey-darken-1">Description</div>
            <EditHtml :contentContainer="galleryDescContainer"/>
         </div>
         <v-row >
            <v-col cols="8"><v-checkbox v-model="descInHeader" label="Place description inside bottom/right of header image" class="ms-n1 mt-n2 tight-checkbox"/></v-col> 
            <v-col><v-text-field v-if="descInHeader" v-model="descHeaderPct" label="Width in header" suffix="%" type="number" class="mt-1"/></v-col>
         </v-row>
         <v-checkbox v-model="shareBackground" label="Share background with Gallery Items" class="ms-n2 mt-2 tight-checkbox"/> 
         <v-checkbox v-model="useAltItemName" label="Use Item Alternate Name, if set, for Thumbnail" class="ms-n2 tight-checkbox"/> 
         <v-checkbox v-model="useLocalItemName" label="Localize Item Name in Thumbnail" class="ms-n2 tight-checkbox"/> 
         <v-row v-if="useLocalItemName" class="mt-3">
            <v-col>
               <v-text-field v-model="itemThumbPrefix" label="Item Thumb Prefix"/>
            </v-col>
            <v-col>
               <v-text-field v-model="itemThumbReplace" label="Item Thumb Prefix Replace"/>
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
   import { useUserMgr }      from '@/stores/userMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useProfileStore } from '@/stores/profileStore'
   import EditHtml from '@/components/util/EditHtml.vue'
   import { requiredRule } from '@/utils/utils'
   import { Emit, GalleryStates } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object })
   const emit = defineEmits([ Emit.DONE ])

   const userMgr = useUserMgr()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const profileStore = useProfileStore()
   const galleryName  = ref('')
   const galleryTag   = ref('')
   const galleryState = ref('')
   const galleryDescContainer = ref({ content: "" })
   const galleryProfileId = ref(null)
   const galleryContributorIds = ref(null)
   const descInHeader  = ref(false)
   const descHeaderPct = ref(60)
   const childGalleries = ref([])
   const itemThumbPrefix  = ref('')
   const itemThumbReplace = ref('')
   const shareBackground  = ref(false)
   const useAltItemName   = ref(false)
   const useLocalItemName = ref(false)
   const dataValid = ref(true)
   
   onMounted(() => {
      galleryName.value  = props.gallery.name
      galleryTag.value   = props.gallery.tag ?? ""
      galleryState.value = props.gallery.state
      galleryProfileId.value       = props.gallery.profileId      ?? null // consistent null instead of undefined
      galleryContributorIds.value  = props.gallery.contributorIds ?? null
      galleryDescContainer.value.content = props.gallery.desc ?? ""
      descInHeader.value      = props.gallery.descInHeader     ?? false
      descHeaderPct.value     = props.gallery.descHeaderPct    ?? 60
      shareBackground.value   = props.gallery.shareBackground  ?? false
      useAltItemName.value    = props.gallery.useAltItemName   ?? false
      useLocalItemName.value  = props.gallery.useLocalItemName ?? false
      itemThumbPrefix.value   = props.gallery.itemThumbPrefix  ?? ""
      itemThumbReplace.value  = props.gallery.itemThumbPrefixReplace ?? "" 

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
   
   const profiles   = computed(() => [ ...profileStore.myProfiles ])
   const otherUsers = computed(() => [ ...userMgr.otherUsers ])
   
   const sortChildGalleries = () => { childGalleries.value.sort((a, b) => a.name.localeCompare(b.name)) }
   const childGalleryOptions = computed(() => { 
      const galleries = [] 

      // why was this changed?  editing profile gallery?  contributor?
      // for (const gallery of galleryStore.myGalleries) {
      for (const gallery of galleryMgr.getUserGalleries(props.gallery.userId) ) {
         if (isChildGalleryOption(gallery)) { galleries.push(gallery) }
      }
      return galleries
   })

   const isChildGalleryOption = (gallery) => {
      return (gallery.id != props.gallery.id) && // cannot be your own child
             (props.gallery.parentGalleryId == null || props.gallery.parentGalleryId != gallery.id) && // cannot be your parent 
             (gallery.parentGalleryId == null || gallery.parentGalleryId == props.gallery.id) // cannot have a diff parent 
   }
   const childGalleryCols = computed(() => { 
      if (!childGalleries.value?.length && !galleryContributorIds.value?.length ||
          childGalleries.value?.length && galleryContributorIds.value?.length) { return 6 } // 50/50 split
      else if (childGalleries.value?.length ) { return 9 } // 75% of row
      else if (galleryContributorIds.value?.length ) { return 3 } // 25% 
      return 6
   })
   
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
         profileId: galleryProfileId.value,
         contributorIds: galleryContributorIds.value,
         desc: galleryDescContainer.value.content,
         descInHeader:     descInHeader.value,
         descHeaderPct:    descHeaderPct.value,
         shareBackground:  shareBackground.value,
         useAltItemName:   useAltItemName.value,
         useLocalItemName: useLocalItemName.value,
         itemThumbPrefix:  itemThumbPrefix.value,
         itemThumbPrefixReplace: itemThumbReplace.value,
         images: updatedImages,
         childGalleryIds: childGalleryIds
      })
         
      emit(Emit.DONE)
   }
</script>

<style>
</style>
