import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const useFetchDocument = (docCollection, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);

      try {
        const docRef = await doc(db, docCollection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // 🎉 Esta é a linha mais importante! 
          // Ela combina os dados do documento com o ID do próprio documento.
          setDocument({
            id: docSnap.id,
            ...docSnap.data(),
          });
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
  }, [docCollection, id]);

  return { document, loading, error };
};
