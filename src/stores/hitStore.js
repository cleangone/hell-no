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
   
   const rawHits = useFirestore(hitCollection)   
   const hits = computed(() => rawHits.value ? 
      rawHits.value.toSorted(function(a, b) {return b.dateModified - a.dateModified}) : [])
   const idToHit = computed(() => { return rawHits.value ? new Map(rawHits.value.map((obj) => [obj.id, obj])) : new Map() })
   function getHit(id) { return idToHit.value ? idToHit.value.get(id) : null } 

   // assume update, add if error
   function addHit(id) { 
      updateDoc(hitDoc(id), { id:id, views: increment(1), dateModified:serverTimestamp() })
         .catch((error) => {
            setDoc(hitDoc(id), {
               id: id,
               views: 1,
               dateCreated:  serverTimestamp(),
               dateModified: serverTimestamp()
            })
         })
   }

   return { 
      hits, getHit, addHit
   }
})
