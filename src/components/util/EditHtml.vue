<template>
   <ckeditor :editor="editor" v-model="props.contentContainer.content" :config="editorConfig" class="px-5"></ckeditor>
</template>

<script setup>
   import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

   const props = defineProps({ contentContainer: Object })

   const editor = ClassicEditor
   const editorConfig = {}
</script>

