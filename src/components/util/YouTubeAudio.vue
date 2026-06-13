<template>
   <div class="audio-player">
      <button @click="togglePlay()">{{ isPlaying ? 'Pause' : 'Play' }}</button> 
      <iframe :src="embedUrl" ref="ytIframe" frameborder="0" allow="autoplay" style="display:none;"/>
  </div>
</template>

<script setup>
   import { ref, computed, onMounted, onUnmounted } from 'vue';

   const props = defineProps({ text: String })

   const youtubeUrl = ref('https://www.youtube.com/watch?v=LQXcfwRy6Ig&list=RDLQXcfwRy6Ig&start_radio=1'); 
   const isPlaying = ref(false)
   const ytIframe = ref(null)

   onMounted(() => {
      console.log("mounted")
      window.addEventListener('message', handleMessage)

      setTimeout(() => { 
         console.log("togglePlay")
         togglePlay()
      }, 2000)
   })

   onUnmounted(() => {
      console.log("unmounted")
      window.removeEventListener('message', handleMessage)
   })

   const embedUrl = computed(() => {
      if (videoId.value) {
         return "https://youtube.com/embed/" + videoId.value + "?enablejsapi=1&version=3&playerapiid=ytplayer"         
      }
      else { return "" }
   })

   const videoId = computed(() => {
      try {
         if (youtubeUrl.value.includes('watch?v=')) {
            const urlObj = new URL(youtubeUrl.value)
            return urlObj.searchParams.get('v')
         }
      }
      catch (error) {
         console.error('Invalid URL', error);
         return null
      }
   })

   const togglePlay = () => {
      const iframeWindow = ytIframe.value?.contentWindow;
      if (iframeWindow) {
         if (isPlaying.value) {
            iframeWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
            isPlaying.value = false
         } 
         else {
            iframeWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
            isPlaying.value = true
         }
      }
   }

   const handleMessage = (evt) => {
      if (evt.origin !== 'https://youtube.com') return
      try {
         const data = JSON.parse(evt.data);
         console.log('YT State:', data);
      } 
      catch (e) {
         console.log("error", e)
      }
   }
</script>