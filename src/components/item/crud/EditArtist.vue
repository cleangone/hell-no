<template>
   <v-row no-gutters class="align-center">
      <v-col cols="7">
         <v-combobox v-model="props.editArtistContainer.artistOption" label="Artist" :items="artistOptions" 
            clearable @click:clear="$emit(Emit.DELETE)" compact hide-details/>
      </v-col>
      <v-col>
         <v-combobox v-model="props.editArtistContainer.role" label="Artist Role" :items="roles" 
            :disabled="!props.editArtistContainer.artistOption" clearable compact hide-details class="ms-2"/>      
      </v-col>
      <v-icon v-if="props.showDelete" icon="mdi-close-circle" @click="$emit(Emit.DELETE)" color="grey-darken-1" class="mx-2"/>
   </v-row>
</template>

<script setup>
   import { computed } from 'vue'
   import { useArtistMgr } from '@/stores/artistMgr'
   import { ArtistRoles, Emit }  from '@/utils/constants'
   
   const props = defineProps({ editArtistContainer: Object, showDelete: Boolean })
   const emit = defineEmits([Emit.DELETE])
   
   const artistMgr = useArtistMgr()
   
   const artistOptions = computed(() => artistMgr.artistOptions)
   const roles         = computed(() => ArtistRoles)
</script>
