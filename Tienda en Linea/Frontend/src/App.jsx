import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";

import Header from "./Componentes/Header";
import Footer from "./Componentes/Footer";
import CartSidebar from "./Componentes/CartSidebar";

import Home from "./Home/HomePage";
import AboutUs from "./Home/AboutUsPage";
import Tienda from "./Componentes/Shop.jsx";
import ProductDetail from "./Products/ProductDetails";
import CartPage from "./Products/CartPage";
import CheckoutPage from "./Products/CheckoutPage";
import SummaryPage from "./Products/SummaryPage";
import PaymentPage from "./Products/PaymentPage";

import "./index.css";

const MainLayout = () => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("befitCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("befitCart", JSON.stringify(cartItems));
  }, [cartItems]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const hideSidebar =
    ["/CartPage", "/CheckoutPage", "/Resumen", "/Pago"].includes(location.pathname);

  const addToCart = (product, quantity = 1) => {
    const qty = Number(quantity) || 1;
    setCartItems((prev) => {
      const productId = product.product_id || product.id;
      const exists = prev.find((item) => (item.product_id || item.id) === productId);
      const stock = product.stock ?? product.stock_quantity ?? Infinity;
      if (exists) {
        return prev.map((item) => {
          if ((item.product_id || item.id) !== productId) return item;
          const nextQty = Math.min(item.quantity + qty, stock);
          return { ...item, quantity: nextQty, stock };
        });
      }
      return [
        ...prev,
        {
          ...product,
          id: productId,
          product_id: productId,
          title: product.name || product.title,
          name: product.name || product.title,
          price: Number(product.price) || 0,
          imageSrc: product.imageSrc || product.primary_image,
          stock,
          quantity: Math.min(qty, stock),
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => (item.product_id || item.id) !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) =>
      prev.map((item) => {
        if ((item.product_id || item.id) !== id) return item;
        const max = item.stock ?? qty;
        return { ...item, quantity: Math.min(qty, max) };
      })
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <>
      <Header
        cartItems={cartItems}
        onCartClick={() => {
          if (!hideSidebar) setIsCartOpen(true);
        }}
      />
      <CartSidebar
        isOpen={isCartOpen && !hideSidebar}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
      <Outlet
        context={{
          cartItems,
          addToCart,
          removeFromCart,
          updateQuantity,
          setIsCartOpen,
          clearCart,
        }}
      />
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/aboutUsPage" element={<AboutUs />} />
          <Route path="/Productos" element={<Tienda />} />
          <Route path="/CartPage" element={<CartPage />} />
          <Route path="/CheckoutPage" element={<CheckoutPage />} />
          <Route path="/Resumen" element={<SummaryPage />} />
          <Route path="/Pago" element={<PaymentPage />} />
          <Route path="/:productName/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}


