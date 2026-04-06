<template>
   <v-card title="Action" class="view-action-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </template>
     
      <div class="ml-4">
         <tr v-for="actionField in actionFields">
            <td class="font-weight-bold action-field-name">{{ actionField.name }}:</td>
            <td>{{ actionField.value }}</td>
         </tr>
      </div>
     
      <v-container v-if="action.emailPackage" v-html="action.emailPackage.html" />
   </v-card>
</template>

<script setup>
   import { computed } from 'vue'
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit } from '@/utils/constants'

   const props = defineProps({ action: Object })
   const emit  = defineEmits([ Emit.DONE ])

   const actionFields = computed(() => [
      actionField("Type",      props.action.actionType), 
      actionField("Status",    props.action.actionStatus), 
      actionField("Username",  props.action.username), 
      actionField("Scheduled", props.action.isScheduled ? "Yes" : ""),
      actionField("Created",   props.action.dateCreated.toDate().toLocaleDateString() + " " + 
                               props.action.dateCreated.toDate().toLocaleTimeString())
   ])

   const actionField = (name, value) => { return {name: name, value: value } }
</script>

<style>
.view-action-dialog {
   min-width:  500px;
   min-height: 500px;
}
.action-field-name {
   min-width:  6em;
}
</style>
