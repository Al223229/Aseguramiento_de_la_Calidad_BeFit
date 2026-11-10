{
/*
 * Autor: Ricardo Rodriguez
 * Componente: Header
 * Descripción: Barra de navegación principal responsive que incluye búsqueda, menú de categorías desplegable y gestión de carrito, con animación al hacer scroll.
 */
}
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Befitwhite.png";
import drop_down from "../assets/arrow_drop_down.png";

const MotionLink = motion(Link);

const desktopDropdownVariants = {
  hidden: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeOut" } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -50, transition: { duration: 0.3, ease: "easeOut", when: "afterChildren" } },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3, 
      ease: "easeIn", 
      staggerChildren: 0.05,
      delayChildren: 0.1
    } 
  }
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const cartCounterVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 20 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
};


function Header({ cartItems = [], onCartClick }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const categories = [
    { name: "Proteínas", link: "/Productos?category=Proteínas" },
    { name: "Creatina", link: "/Productos?category=Creatina" },
    { name: "Snacks", link: "/Productos?category=Snacks" },
    { name: "Pre-entreno", link: "/Productos?category=Pre-entreno" },
    { name: "Vitaminas", link: "/Productos?category=Vitaminas" },
    { name: "Accesorios", link: "/Productos?category=Accesorios" },
  ];

  const handleSearch = (event) => {
    event.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/Productos?query=${encodeURIComponent(q)}` : "/Productos");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header 
        className={`bg-[#70AA77] w-full h-20 font-montserrat fixed top-0 left-0 right-0 z-50`}
        animate={{ y: isVisible ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src={logo} 
              alt="Logo Befit" 
              className="w-16 md:w-32 h-auto object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          </motion.div>

          {/* Boton Productos - Desktop */}
          <div className="hidden lg:flex items-center gap-2 ml-8">
            <motion.button
              type="button"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-semibold text-white text-base">
                Productos
              </span>
              <motion.img
                className={`w-6 h-6`}
                alt="dropdown arrow"
                src={drop_down}
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>

          {/* Barra de busqueda - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="w-full h-12 bg-white rounded-full border border-gray-300 flex items-center px-6 shadow-sm">
              <input
                id="search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full font-light text-gray-700 text-base bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </form>

          
          {/* Navegacion derecha - Desktop */}
          <nav
            className="hidden md:flex items-center gap-4 lg:gap-6"
            aria-label="User navigation"
          >
              <>
            <motion.button 
              type="button" 
              aria-label="Shopping cart" 
              className="hover:opacity-80 transition-opacity relative"
              onClick={onCartClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="35" height="28" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M49.298 40V35.1223H25.4607L23.0827 28.2107H51.5084L60 4.47189H54.9223L48.1755 23.333H21.4041L13.3765 0H11.4463H0V4.87771H9.99879L22.0832 40H49.298Z" fill="white" />
              </svg>
              
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    className="absolute -top-2 -right-3 bg-[#1877F2] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    variants={cartCounterVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
              </>
          </nav>

          {/* Boton menu movil */}
          <motion.button
            type="button"
            className="md:hidden flex items-center text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="w-6 h-6"
              key={isMobileMenuOpen ? "close" : "open"}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="md:hidden absolute top-20 left-0 right-0 bg-[#70AA77] border-t border-white/20 shadow-lg z-40 max-h-[calc(100vh-5rem)] overflow-y-auto"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="px-4 py-3 space-y-3">
                {/* Barra de búsqueda movil */}
                <motion.form
                  onSubmit={handleSearch}
                  className="w-full h-10 bg-white rounded-full flex items-center px-4"
                  variants={mobileItemVariants}
                >
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full font-light text-gray-700 text-sm bg-transparent outline-none placeholder:text-gray-400"
                  />
                </motion.form>

                {/* Boton Productos movil */}
                <motion.button
                  type="button"
                  className="w-full flex items-center justify-between py-2 text-white font-semibold"
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  variants={mobileItemVariants}
                >
                  <span>Productos</span>
                  <motion.img
                    className={`w-5 h-5`}
                    alt="dropdown arrow"
                    src={drop_down}
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  />
                </motion.button>

                {/* Dropdown de categorias movil */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      className="bg-[#B8D2B1] rounded-lg p-3 space-y-2 overflow-hidden" // Añadido overflow-hidden
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {categories.map((item) => (
                        <MotionLink
                          key={item.name}
                          to={item.link}
                          className="block py-2 px-3 font-semibold text-base text-green-800 hover:text-[#6d8c66] hover:bg-white/20 rounded transition-colors"
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.name}
                        </MotionLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navegacion movil corregida */}
                  <motion.div 
                    className="flex items-center justify-around py-3 border-t border-white/20 text-white"
                    variants={mobileItemVariants}
                  >
                    
                    <Link
                      to="/Productos"
                      className="flex flex-col items-center gap-1 text-white text-xs font-semibold"
                    >
                      Catálogo
                    </Link>
                  
                  <motion.button
                    onClick={() => { onCartClick?.(); setIsMobileMenuOpen(false); }}
                    className="flex flex-col items-center gap-1 text-white relative" 
                    aria-label="Shopping cart"
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 60 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                       <path
                          d="M49.298 40V35.1223H25.4607L23.0827 28.2107H51.5084L60 4.47189H54.9223L48.1755 23.333H21.4041L13.3765 0H11.4463H0V4.87771H9.99879L22.0832 40H49.298Z"
                       />
                    </svg>
                    <AnimatePresence>
                      {totalItems > 0 && (
                        <motion.span 
                          className="absolute -top-1 -right-3 text-[#1877F2] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center bg-white"
                          variants={cartCounterVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {totalItems}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span className="text-xs">Carrito</span>
                  </motion.button>

                  </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Espaciador para compensar el header fixed */}
      <div className="h-20"></div>

      <AnimatePresence>
        {isVisible && isDropdownOpen && (
          <motion.div
            className={`hidden lg:block fixed top-20 left-0 right-0 z-40 overflow-hidden bg-[#B8D2B1] shadow-inner`}
            variants={desktopDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="max-w-7xl mx-auto flex justify-around items-center h-16 px-6">
              {categories.map((item) => (
                <MotionLink
                  key={item.name}
                  to={item.link}
                  className="font-semibold text-lg text-green-800 transition-colors"
                  whileHover={{ color: "#2c5228" }} // Más oscuro
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </MotionLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;