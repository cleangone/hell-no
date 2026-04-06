<template>
   <v-col>
      <v-checkbox v-for="obj in objCol" :key="obj.id" v-model="obj.selected" :label="obj.name" class="tight-checkbox"/>
   </v-col>           
</template>

<script setup>
   const props = defineProps({objCol: Object})
</script>

