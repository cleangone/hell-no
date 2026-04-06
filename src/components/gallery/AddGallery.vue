<template>
   <v-card title="Add Gallery" class="edit-dialog">
      <v-form v-model="dataValid">
         <div class="pa-md-4">
            <v-text-field v-model="galleryName" label="Gallery Name" :rules="requiredRule"/>
            <v-select v-model="galleryState" label="Gallery State" :items="GalleryStates"/>
            <v-select v-if="galleryOptions.length" v-model="parentGalleryId" label="Parent Gallery" :items="galleryOptions" clearable density="compact"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">Save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { requiredRule } from '@/utils/utils'
   import { Emit, GalleryStates, State } from '@/utils/constants'
   
   const props = defineProps(['userId'])
   const emit = defineEmits([Emit.DONE])

   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const galleryName = ref('')
   const galleryState = ref(State.PRIVATE)
   const parentGalleryId = ref(null)
   const dataValid = ref(true)
   
   const galleryOptions = computed(() => galleryMgr.getGalleryOptions(props.userId))
 
   const save = () => {
      const galleryId = galleryStore.addGallery({
         name: galleryName.value,
         userId: props.userId,
         state: galleryState.value,
         itemIds: [],
         groupIds: [],
         parentGalleryId: parentGalleryId.value
      })

      if (parentGalleryId.value) {
         galleryStore.addChildGalleryId(parentGalleryId.value, galleryId)
      }

      emit(Emit.DONE)
   }
</script>

<style>
</style>
