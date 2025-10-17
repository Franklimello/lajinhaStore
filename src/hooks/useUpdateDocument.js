// src/hooks/useUpdateDocument.js
import { useReducer, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { storage, buildKey } from "../utils/storage";

// Estado inicial
const initialState = {
  loading: false,
  error: null,
  success: false,
};

// Reducer para controlar o estado da requisição
const updateReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { loading: true, error: null, success: false };
    case "UPDATED_DOC":
      return { loading: false, error: null, success: true };
    case "ERROR":
      return { loading: false, error: action.payload, success: false };
    default:
      
      return state;
  }
};

export const useUpdateDocument = (docCollection) => {
  const [response, dispatch] = useReducer(updateReducer, initialState);
  const [cancelled, setCancelled] = useState(false);

  function checkCancelBeforeDispatch(action) {
    if (!cancelled) {
      dispatch(action);
    }
  }

  const updateDocument = async (id, data) => {
    checkCancelBeforeDispatch({ type: "LOADING" });

    try {
      const docRef = doc(db, docCollection, id);
      await updateDoc(docRef, data);

      checkCancelBeforeDispatch({
        type: "UPDATED_DOC",
      });

      // cache: update document key and collection list if present
      const docKey = buildKey(["doc", docCollection, id]);
      const existingDoc = storage.get(docKey, { namespace: "firestore" });
      const nextDoc = { ...(existingDoc || { id }), ...data };
      storage.set(docKey, nextDoc, { namespace: "firestore" });

      const colKey = buildKey(["col", docCollection]);
      const col = storage.get(colKey, { namespace: "firestore" });
      if (Array.isArray(col)) {
        const updated = col.map((d) => (d.id === id ? { ...d, ...data } : d));
        storage.set(colKey, updated, { namespace: "firestore" });
      }
    } catch (error) {
      checkCancelBeforeDispatch({
        type: "ERROR",
        payload: error.message,
      });
    }
  };

  useEffect(() => {
    return () => {
      // Só cancela se ainda estiver carregando
      if (response.loading) {
        setCancelled(true);
      }
    };
  }, [response.loading]);
  

  return { updateDocument, response };
};
