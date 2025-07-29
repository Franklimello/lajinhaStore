import Logo from "../../assets/logo.png";
import { BsList, BsX } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";

import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <section className="flex items-center justify-between w-full relative p-4 bg-white shadow-md">
      {/* Botão menu hamburguer mobile */}
      <div className="lg:hidden">
        <button onClick={toggleMenu}>
          <BsList size={30} />
        </button>
      </div>

      {/* Logo centralizado */}
      <div className="flex-grow text-center">
        <div className="w-[100px] mx-auto">
          <NavLink to="/">
            <img src={Logo} alt="logo" />
          </NavLink>
        </div>
      </div>

      {/* Ícone carrinho mobile */}
      <div className="lg:hidden">
        <button>
          <FaShoppingCart size={28} className="text-orange-600 hover:text-black" />
        </button>
      </div>

      {/* Menu desktop */}
      <nav className="hidden lg:flex">
        <ul className="flex mr-6 space-x-6 text-orange-500 font-semibold">
          
          
          
          <li className="cursor-pointer border-2 border-orange-500 p-2 rounded-md hover:text-black hover:border-black transition-colors duration-200">
            <NavLink to="/painel" onClick={handleNavClick}>
                Admin
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Menu mobile aberto */}
      {isMenuOpen && (
        <nav className="fixed top-0 left-0 w-full h-screen bg-white text-orange-800 font-bold text-lg shadow-lg z-50 p-6">
          <div className="flex justify-between items-start mb-8">
            <div className="w-[100px]">
              <NavLink to="/">
                <img src={Logo} alt="logo" />
              </NavLink>
            </div>
            <button onClick={toggleMenu}>
              <BsX size={35} />
            </button>
          </div>

          <ul className="flex flex-col gap-6">
            
            <li className="cursor-pointer border-2 border-orange-500 p-2 rounded-md hover:text-black hover:border-black transition-colors duration-200 mt-10 max-w-max">
              <NavLink to="/painel" onClick={handleNavClick}>
                Admin
            </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </section>
  );
}
