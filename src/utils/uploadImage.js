export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "uploadEmpregue"); // seu preset correto

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dxkmqaqjs/image/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Falha no upload da imagem");
    }

    const data = await response.json();
    return data.secure_url; // URL segura da imagem
  } catch (error) {
    console.error("Erro ao enviar imagem para Cloudinary:", error);
    return null; // ou você pode propagar o erro, dependendo do seu fluxo
  }
};
