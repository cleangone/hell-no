<template>
   <v-row no-gutters class="align-center">
      <v-col cols="7">
         <v-combobox v-model="props.artistContainer.artistOption" label="Artist" :items="artistOptions" 
            clearable @click:clear="$emit(Emit.DELETE)" compact hide-details/>
      </v-col>
      <v-col>
         <v-combobox v-model="props.artistContainer.role" label="Artist Role" :items="roles" 
            :disabled="!props.artistContainer.artistOption" clearable compact hide-details class="ms-2"/>      
      </v-col>
      <v-icon v-if="props.showDelete" icon="mdi-close-circle" @click="$emit(Emit.DELETE)" color="grey-darken-1" class="mx-2"/>
   </v-row>
</template>

<script setup>
   import { computed } from 'vue'
   import { useArtistMgr } from '@/stores/artistMgr'
   import { ArtistRoles, Emit }  from '@/utils/constants'
   
   const props = defineProps({ artistContainer: Object, showDelete: Boolean })
   const emit = defineEmits([Emit.DELETE])
   
   const artistMgr = useArtistMgr()
   
   const artistOptions = computed(() => artistMgr.artistOptions)
   const roles         = computed(() => ArtistRoles)
</script>
