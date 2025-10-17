import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config"
import { storage, buildKey } from "../utils/storage";

import { collection, query, onSnapshot, getDocs } from "firebase/firestore";

export const useGetDocuments = (docCollection, { ttlMs = 5 * 60 * 1000, persist = "session", realTime = false } = {}) => {
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


    if (realTime) {
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
    } else {
      (async () => {
        try {
          const snap = await getDocs(q);
          if (!cancelledRef.current) {
            const fresh = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDocuments(fresh);
            storage.set(cacheKey, fresh, { ttlMs, persist, namespace: "firestore" });
          }
        } catch (err) {
          if (!cancelledRef.current) {
            console.error(err);
            setError(err.message);
          }
        } finally {
          if (!cancelledRef.current) setLoading(false);
        }
      })();

      return () => {
        cancelledRef.current = true;
      };
    }
  }, [docCollection, ttlMs, persist, realTime]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return { documents, loading, error };
};