import { useNavigate } from 'react-router-dom';

export default function Categorias() {
    const navigate = useNavigate();

    const categories = [
        { 
            name: 'Hortifruti', 
            path: '/hortifruti',
            icon: '🥬',
            description: 'Frutas, verduras e legumes frescos'
        },
        { 
            name: 'Açougue', 
            path: '/acougue',
            icon: '🥩',
            description: 'Carnes frescas e produtos do açougue'
        },
        { 
            name: 'Frios e laticínios', 
            path: '/frios-laticinios',
            icon: '🧀',
            description: 'Queijos, frios e produtos lácteos'
        },
        { 
            name: 'Mercearia', 
            path: '/mercearia',
            icon: '🛒',
            description: 'Produtos essenciais do dia a dia'
        },
        { 
            name: 'Guloseimas e snacks', 
            path: '/guloseimas-snacks',
            icon: '🍫',
            description: 'Doces, chocolates e petiscos'
        },
        { 
            name: 'Bebidas', 
            path: '/bebidas',
            icon: '🥤',
            description: 'Bebidas, sucos e refrigerantes'
        },
        { 
            name: 'Limpeza', 
            path: '/limpeza',
            icon: '🧹',
            description: 'Produtos de limpeza e higienização'
        },
        { 
            name: 'Higiene pessoal', 
            path: '/higiene-pessoal',
            icon: '🧴',
            description: 'Produtos para higiene e cuidados pessoais'
        },
        { 
            name: 'Utilidades domésticas', 
            path: '/utilidades-domesticas',
            icon: '🏠',
            description: 'Utensílios e itens para o lar'
        },
        { 
            name: 'Pet shop', 
            path: '/pet-shop',
            icon: '🐾',
            description: 'Produtos para seu pet'
        },
        { 
            name: 'Infantil', 
            path: '/infantil',
            icon: '👶',
            description: 'Produtos para bebês e crianças'
        },
        { 
            name: 'Farmácia', 
            path: '/farmacia',
            icon: '💊',
            description: 'Produtos para saúde e bem-estar'
        },
    ];

    const handleCategoryClick = (category) => {
        navigate(category.path);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Categorias
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore nossas categorias de produtos e encontre exatamente o que você precisa
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <div key={index} className="group">
                            <button
                                onClick={() => handleCategoryClick(category)}
                                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 p-8 text-center border border-gray-100 hover:border-indigo-200"
                            >
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {category.description}
                                </p>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm">
                        ✨ Clique em uma categoria para navegar diretamente para a página
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </section>
    );
}