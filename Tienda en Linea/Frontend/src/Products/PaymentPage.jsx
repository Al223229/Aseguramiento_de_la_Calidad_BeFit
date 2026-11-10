import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useOutletContext();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [totals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("checkoutTotals") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem("checkoutCustomer") || !cartItems.length) {
      if (!done) navigate("/Resumen");
    }
  }, [cartItems, navigate, done]);

  const confirmPurchase = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setDone(true);
      clearCart();
      localStorage.removeItem("checkoutCustomer");
      localStorage.removeItem("checkoutTotals");
    }, 600);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center border border-gray-100">
          <h1 className="text-2xl font-extrabold text-[#334173] mb-3">Compra realizada con éxito</h1>
          <p className="text-gray-600 mb-6">Gracias por tu compra.</p>
          <Link to="/Productos" className="inline-block bg-[#5CA982] text-white px-8 py-3 rounded-full font-bold">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Paso 3 de 3</p>
        <h1 className="text-2xl font-extrabold text-[#334173] mb-2">Confirmar compra</h1>
        <p className="text-gray-500 text-sm mb-6">
          Total: <strong>${Number(totals?.total || 0).toFixed(2)}</strong>
        </p>
        <button
          type="button"
          onClick={confirmPurchase}
          disabled={processing}
          className="w-full bg-[#334173] text-white py-3 rounded-full font-bold disabled:opacity-60"
        >
          {processing ? "Procesando..." : "Confirmar compra"}
        </button>
        <Link to="/Resumen" className="block text-center mt-4 text-sm text-[#334173] font-semibold">
          Volver al resumen
        </Link>
      </div>
    </div>
  );
}
