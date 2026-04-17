<template>
   <v-menu> 
      <template v-slot:activator="{ props }">
         <v-btn v-bind="props" icon="mdi-link-box-variant" 
            color="blue-darken-2" size="medium" variant="text"></v-btn>
      </template>
      <v-list>
         <v-list-item @click="copyLinkToClipboard()">
            <v-list-item-title>Copy expanded {{ props.route }} link</v-list-item-title>
         </v-list-item>
      </v-list>
   </v-menu>
</template>

<script setup>
   const props = defineProps({ route: String, id: String })

   const copyLinkToClipboard = () => { 
      // const link = window.location.origin + "/link/?route=" + props.route + "&id=" + props.id

      // todo - using hell-no until v1/v2 get fllipped
      const link = "https://link.hell-no.gallery" + "/link/?route=" + props.route + "&id=" + props.id
      navigator.clipboard.writeText(link) 
   }
</script>

