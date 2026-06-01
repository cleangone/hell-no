<template>
   <v-expansion-panel class="mb-3">
      <v-expansion-panel-title>
         <span style="font-size: medium; font-weight: bold" class="pe-2">{{ title }}</span>     
         {{ artistNames }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
         <div class="mt-3"></div>
         <v-hover v-for="(artist, index) in artists" :key="artist.id" v-slot:default="{ isHovering, props }">
            <v-row justify="space-between" class="ml-1 mb-2 pa-2" v-bind="props" 
                  :class="isHovering ? 'bg-grey-lighten-3' : 'bg-grey-lighten-4'">
               <div>{{ artist.fullName }}</div> 
               <v-icon v-if="isHovering" icon="mdi-close-circle" @click="deleteArtist(index)" size="small" color="grey-darken-1" class="bg-grey-lighten-3 mr-2 mt-1"/>
            </v-row>
         </v-hover>
         <v-row class="ml-1">
            <v-combobox v-model="newArtistOption" label="Artist" ref="newArtistCombobox" :items="artistOptions"        
               @update:modelValue="addArtist()" compact class=""/>      
         </v-row >
      </v-expansion-panel-text>
   </v-expansion-panel>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useArtistMgr } from '@/stores/artistMgr'
   
   const props = defineProps({ title: String, artists: Array })
   
   const artistMgr = useArtistMgr()
   const newArtistOption   = ref(null)
   const newArtistCombobox = ref(null)

   const artistOptions = computed(() => artistMgr.artistOptions)

   const resetArtistOption = () => {
      newArtistOption.value = null
      if (newArtistCombobox.value) { newArtistCombobox.value.blur() }
   }

   const addArtist = () => { 
      if (newArtistOption.value) { props.artists.push(newArtistOption.value.value) }
      resetArtistOption()
   }

    const deleteArtist = (index) => { 
      props.artists.splice(index, 1)
      resetArtistOption()
   }

   const artistNames = computed(() => { 
      const names = []
      for (const artist of props.artists) {
         names.push(artist.fullName) 
      }
      return names.join(", ")
   })
</script>
