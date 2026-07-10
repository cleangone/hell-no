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
            <draggable v-model="artistContainers" item-key="id">
               <template #item="{element}">
                  <HorizontalDiv style="width:100%" class="mb-2 flex align-center">
                     <v-icon icon="mdi-drag-vertical" color="blue-darken-2" class="pointer"/>
                     <EditArtist :artistContainer="element" showDelete @delete="deleteArtist(element)"/>
                  </HorizontalDiv>
               </template>
            </draggable>
         </v-expansion-panel-text>
      </v-expansion-panel>
   </v-expansion-panels>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import draggable     from 'vuedraggable'
   import EditArtist    from './EditArtist.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import TextButton    from '@/components/util/TextButton.vue'   
   
   const props = defineProps({ title: String, artistContainers: Array })
   const openedPanels = ref([])

   const onPanelChange = () => { if (!props.artistContainers.length) { addArtist() } }
   const addArtist = () => { props.artistContainers.push({ artistOption: null, role: null}) }
   
   const artistNames = computed(() => { 
      const names = []
      for (const container of props.artistContainers) {
         if (container.artistOption) { 
            names.push(container.artistOption.title + (container.role ? " - " + container.role : "")) 
         }
      }
      return names.join(", ")
   })

   const artistContainers = computed({ 
      get() { return props.artistContainers },
      set(reorderedContainers) { 
         props.artistContainers.splice(0, props.artistContainers.length, ...reorderedContainers) }
   })

   const deleteArtist = (container) => { 
      const index = props.artistContainers.indexOf(container)
      props.artistContainers.splice(index, 1) 
   }
</script>
