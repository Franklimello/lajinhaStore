import { useState,useEffect,useReducer } from "react";
import {db} from "../firebase/config"
import { doc, deleteDoc } from "firebase/firestore"
import { storage, buildKey } from "../utils/storage";

const initialState = {
    loading: null,
    error:null,
    sucess:null
}

const deleteReducer = (state,action) => {
    switch(action.type){
    case "LOADING":
      return { loading: true, error: null, success: false };
    case "DELETE_DOC":
      return { loading: false, error: null, success: true };
    case "ERROR":
      return { loading: false, error: action.payload, success: false };
    default:
      return state
    }
}

export const useDeleteDocument = (docCollection) =>{
    const [response, dispatch] = useReducer(deleteReducer,initialState)

    const [cancelled,setCancelled] = useState(false)

    const checkCancelBeforeDispatch= (action) => {
        if(!cancelled){
            dispatch(action)
        }
    }

    const deleteDocument = async (id) => {
        checkCancelBeforeDispatch({type:"LOADING"})

    try {
      const docRef = doc(db, docCollection, id); 
      await deleteDoc(docRef); 

      checkCancelBeforeDispatch({ type: "DELETE_DOC" });

      // cache: remove doc and update collection array if present
      const docKey = buildKey(["doc", docCollection, id]);
      storage.remove(docKey, { namespace: "firestore" });
      const colKey = buildKey(["col", docCollection]);
      const col = storage.get(colKey, { namespace: "firestore" });
      if (Array.isArray(col)) {
        const next = col.filter((d) => d.id !== id);
        storage.set(colKey, next, { namespace: "firestore" });
      }
    } catch (error) {
      checkCancelBeforeDispatch({
        type: "ERROR",
        payload: error.message,
      });
    }
    }

    useEffect(() => {
    return () => setCancelled(true); // <- define como cancelado quando desmonta
  }, []);

  return { deleteDocument, response };
}