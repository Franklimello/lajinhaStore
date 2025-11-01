import { useReducer, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, buildKey } from "../utils/storage";

const initialState = {
  loading: false,
  error: null,
  success: false,
  id: null,
};

const addReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { loading: true, error: null, success: false, id: null };
    case "ADDED_DOC":
      return { loading: false, error: null, success: true, id: action.payload };
    case "ERROR":
      return { loading: false, error: action.payload, success: false, id: null };
    default:
      return state;
  }
};

export const useAddDocument = (docCollection) => {
  const [response, dispatch] = useReducer(addReducer, initialState);
  const [cancelled, setCancelled] = useState(false);

  function checkCancelBeforeDispatch(action) {
    if (!cancelled) dispatch(action);
  }

  const addDocument = async (data) => {
    checkCancelBeforeDispatch({ type: "LOADING" });
    try {
      const colRef = collection(db, docCollection);
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(colRef, payload);

      checkCancelBeforeDispatch({ type: "ADDED_DOC", payload: docRef.id });

      // Invalida cache da coleção
      const colKey = buildKey(["col", docCollection]);
      storage.remove(colKey, { namespace: "firestore" });
      return docRef.id;
    } catch (error) {
      checkCancelBeforeDispatch({ type: "ERROR", payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { addDocument, response };
};









