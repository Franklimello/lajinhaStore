import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { storage, buildKey } from "../utils/storage";

export const useFetchDocument = (docCollection, id, { ttlMs = 5 * 60 * 1000, persist = "session" } = {}) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);

      const cacheKey = buildKey(["doc", docCollection, id]);
      const cached = storage.get(cacheKey, { namespace: "firestore" });
      if (cached) {
        setDocument(cached);
        setError(null);
      }

      try {
        const docRef = await doc(db, docCollection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fresh = { id: docSnap.id, ...docSnap.data() };
          setDocument(fresh);
          storage.set(cacheKey, fresh, { ttlMs, persist, namespace: "firestore" });
          setError(null);
        } else {
          setDocument(null);
          setError("Documento não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar documento:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docCollection, id, ttlMs, persist]);

  return { document, loading, error };
};
