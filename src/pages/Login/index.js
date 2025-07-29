import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/painel"); // Redireciona para o painel se logar com sucesso
    } catch (err) {
      setErro("Email ou senha incorretos.");
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-bold text-center">Login</h2>
        {erro && <p className="text-red-600 text-center">{erro}</p>}

        <input
          type="email"
          placeholder="Seu e-mail"
          className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Sua senha"
          className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>
      </form>
    </section>
  );
}
