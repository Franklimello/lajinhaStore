import { useState, useEffect } from "react";
import { db } from "../firebase/config"

import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const useGetDocuments = (docCollection) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;

    setLoading(true);

    const collectionRef = collection(db, docCollection);
    
    
    //const q = query(collectionRef, orderBy("createdAt", "desc"));
    const q = query(collectionRef);


    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!cancelled) {
          setDocuments(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
          setLoading(false);
        }
      },
      (error) => {
        if (!cancelled) {
          console.error(error);
          setError(error.message);
          setLoading(false);
        }
      }
    );

    return () => {
      setCancelled(true);
      unsubscribe();
    };
  }, [docCollection ]);

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { documents, loading, error };
};
