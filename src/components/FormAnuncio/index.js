import { useState } from "react";
import {uploadImageToCloudinary} from "../../utils/uploadImage"
import { addDoc, collection } from "firebase/firestore";
import {db} from "../../firebase/config"

export default function FormAnuncio() {

  const [titulo,setTitulo] = useState("")
  const [preco,setPreco] = useState("")
  const [descricao,setDescricao] = useState("")
  const [categoria,setCategoria] = useState("")
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

   const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("Selecione no máximo 3 imagens.");
    } else {
      setFotos(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensagem("")

    try {
      let fotosUrl = []

      for (const foto of fotos){
        const url = await uploadImageToCloudinary(foto)
        if(!url) throw new Error ("falha ao enviar imagem")
          fotosUrl.push(url)
      }

      await addDoc(collection(db,"produtos"),{
        titulo,
        categoria,
        preco,
        descricao,
        fotosUrl,
        criadoEm: new Date()
      })

      setMensagem("Anúncio criado com sucesso")
      setTitulo("")
      setDescricao("")
      setPreco("")
      setFotos([])
    } catch (err) {
      setMensagem("Erro: " + err.message);
    } finally{
      setLoading(false)
    }
     
      
    
  }


  return (
    <section className="flex justify-center p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Criar Anúncio</h2>
        <input
          type="text"
          placeholder="Título do anúncio"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
         onChange={(e)=>setTitulo(e.target.value)}
         value={titulo}/>

        <input
          type="text"
          placeholder="Preço do anúncio"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e)=>setPreco(e.target.value)} 
          
          value={categoria}/>
          <input
          type="text"
          placeholder="categoria"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e)=>setCategoria(e.target.value)} 
          
          value={preco}/>

        <textarea
          placeholder="Descrição do anúncio"
          rows="4"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e)=>setDescricao(e.target.value)}
            value={descricao}>

         </textarea>

        <input
          type="file"
          accept="image/*"
          multiple
          className="border border-gray-300 p-2 rounded"
           onChange={handleFileChange}/>

        <p className="text-sm text-gray-700 font-medium">
          Selecione até 3 imagens
        </p>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Salvar
        </button>
        {mensagem && (
          <p className="text-center text-sm text-green-600 mt-2">{mensagem}</p>
        )}
      </form>
    </section>
  );
}
