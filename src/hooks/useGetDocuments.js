import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config"

import { collection, query, onSnapshot } from "firebase/firestore";

export const useGetDocuments = (docCollection) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (cancelledRef.current) return;

    setLoading(true);

    const collectionRef = collection(db, docCollection);
    
    
    //const q = query(collectionRef, orderBy("createdAt", "desc"));
    const q = query(collectionRef);


    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!cancelledRef.current) {
          setDocuments(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
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
  }, [docCollection]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return { documents, loading, error };
};