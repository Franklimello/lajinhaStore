import React, { useState } from "react";

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // pega o primeiro arquivo selecionado
  };

  const handleUpload = () => {
    if (!file) return alert("Selecione um arquivo primeiro");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "uploadEmpregue");

    fetch("https://api.cloudinary.com/v1_1/dxkmqaqjs/image/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUploadResult(data.secure_url);
      })
      .catch((err) => {
        console.error(err);
        alert("Erro no upload");
      });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Enviar para Cloudinary</button>

      {uploadResult && (
        <div>
          <p>Upload feito com sucesso!</p>
          <img src={uploadResult} alt="Imagem enviada" width={200} />
        </div>
      )}
    </div>
  );
}
