



export default function Busca() {
  return (
    <div className="flex justify-center py-4 ">
      <div className=" flex w-[90%] max-w-6xl">
        <input
          type="text"
          placeholder="Pesquisar..."
          className="border border-orange-800 w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button className="border p-2 rounded-md bg-orange-800 text-white hover:bg-orange-600">
            Buscar
        </button>
      </div>
    </div>
  );
}
