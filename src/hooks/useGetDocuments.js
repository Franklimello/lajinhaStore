import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config"
import { storage, buildKey } from "../utils/storage";

import { collection, query, onSnapshot } from "firebase/firestore";

export const useGetDocuments = (docCollection, { ttlMs = 5 * 60 * 1000, persist = "session" } = {}) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (cancelledRef.current) return;

    setLoading(true);

    const cacheKey = buildKey(["col", docCollection]);
    const cached = storage.get(cacheKey, { namespace: "firestore" });
    if (cached) {
      setDocuments(cached);
      setLoading(false);
    }

    const collectionRef = collection(db, docCollection);
    
    
    //const q = query(collectionRef, orderBy("createdAt", "desc"));
    const q = query(collectionRef);


    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!cancelledRef.current) {
          const fresh = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDocuments(fresh);
          storage.set(cacheKey, fresh, { ttlMs, persist, namespace: "firestore" });
          setLoading(false);
        }
      },
      (error) => {
        if (!cancelledRef.current) {
          console.error(error);
          setError(error.message);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelledRef.current = true;
      unsubscribe();
    };
  }, [docCollection, ttlMs, persist]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return { documents, loading, error };
};