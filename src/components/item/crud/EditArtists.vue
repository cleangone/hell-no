<template>
   <v-expansion-panels v-model="openedPanels" @update:modelValue="onPanelChange()">
      <v-expansion-panel class="mb-3">
         <v-expansion-panel-title v-slot="{ expanded }">
            <span style="font-size: medium; font-weight: bold" class="pe-2">{{ title }}</span>     
            {{ artistNames }}
            <v-spacer/>
            <TextButton v-if="expanded" @click="addArtist()" text="Add Artist" @click.stop/>
         </v-expansion-panel-title>
         <v-expansion-panel-text>
            <div class="mt-3"></div>
            <div v-for="(container, index) in props.editArtistContainers" class="ml-1 mb-2">
               <EditArtist :editArtistContainer="container" showDelete @delete="deleteArtist(index)"/>
            </div>
         </v-expansion-panel-text>
      </v-expansion-panel>
   </v-expansion-panels>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import EditArtist from './EditArtist.vue'
   import TextButton from '@/components/util/TextButton.vue'   
   
   const props = defineProps({ title: String, editArtistContainers: Array })
   const openedPanels = ref([])

   const onPanelChange = () => { if (!props.editArtistContainers.length) { addArtist() } }
   const addArtist = () => { props.editArtistContainers.push({ artistOption: null, role: null}) }
   const deleteArtist = (index) => { props.editArtistContainers.splice(index, 1) }

   const artistNames = computed(() => { 
      const names = []
      for (const container of props.editArtistContainers) {
         if (container.artistOption) { 
            names.push(container.artistOption.title + (container.role ? " - " + container.role : "")) 
         }
      }
      return names.join(", ")
   })
</script>
