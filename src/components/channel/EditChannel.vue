<template>
   <v-card title="Edit Channel" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="name" label="Name" :rules="requiredRule" class="ma-3"/>
            <v-checkbox v-model="active" label="Active" class="ml-1 mt-n5 tight-checkbox"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useChannelStore } from '@/stores/channelStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ channel: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const channelStore = useChannelStore()
   const name = ref('')
   const active = ref(false)
   const dataValid = ref(true)
   
   onMounted(() => {
      name.value = props.channel.name
      if (props.channel.active) { active.value = props.channel.active }
   })
   
   const save = () => { 
      channelStore.updateChannel({ id: props.channel.id, name: name.value, active: active.value })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
