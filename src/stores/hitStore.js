import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'

/*
   Hit
      id (item id)
      views: integer
      dateCreated
      dateModified
*/

const TABLE = 'hits'

export const useHitStore = defineStore('hit', () => {
   const hitCollection = collection(db, TABLE)
   function hitDoc(id) { return doc(db, TABLE, id) }
   
   const hits = useFirestore(hitCollection)   
   const idToHit = computed(() => { return hits.value ? new Map(hits.value.map((obj) => [obj.id, obj])) : new Map() })
   function getHit(id) { return idToHit.value ? idToHit.value.get(id) : null }

   function addHit(id) { 
      if (idToHit.value.has(id)) { 
         updateHit(id, { views: increment(1) }) 
      } 
      else { 
         setDoc(hitDoc(id), {
            id: id,
            views: 1,
            dateCreated:  serverTimestamp(),
            dateModified: serverTimestamp()
         })
       }
   }

   function updateHit(id, hit) { updateDoc(hitDoc(id), { ...hit, dateModified: serverTimestamp() }) }

   return { 
      getHit, addHit
   }
})
