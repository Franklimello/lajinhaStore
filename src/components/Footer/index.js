



function Footer() {
    return (
        <footer className="relative bg-white text-gray-900 py-12 border-t border-gray-200 overflow-hidden w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            
            <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
                {/* Logo/Nome */}
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 mb-2">
                        🛒 Supermercado Online Lajinha
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Qualidade e economia na palma da sua mão
                    </p>
                </div>
 
            </div>
        </footer>
    );
}

export default Footer;
