import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { validateCheckoutCart } from "../utils/api";

export default function SummaryPage() {
  const navigate = useNavigate();
  const { cartItems } = useOutletContext();
  const [customer, setCustomer] = useState(null);
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedCustomer = localStorage.getItem("checkoutCustomer");
    if (!savedCustomer || !cartItems.length) {
      navigate("/CheckoutPage");
      return;
    }
    setCustomer(JSON.parse(savedCustomer));

    validateCheckoutCart(cartItems)
      .then((data) => {
        setTotals(data);
        localStorage.setItem("checkoutTotals", JSON.stringify(data));
        if (!data.valid) {
          const first = data.issues[0];
          setError(
            first
              ? `${first.product_name}: ${first.issue}`
              : "El carrito ya no tiene stock suficiente."
          );
        }
      })
      .catch((err) => setError(err.message));
  }, [cartItems, navigate]);

  if (!customer) return null;

  const subtotal = totals?.subtotal ?? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = totals?.tax ?? subtotal * 0.16;
  const total = totals?.total ?? subtotal + tax;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Paso 2 de 3</p>
          <h1 className="text-2xl font-extrabold text-[#334173] mb-6">Resumen de compra</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <h2 className="font-bold mb-3">Productos</h2>
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <div key={item.product_id || item.id} className="flex justify-between text-sm border-b border-gray-100 pb-3">
                <div>
                  <p className="font-semibold">{item.name || item.title}</p>
                  <p className="text-gray-500">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <h2 className="font-bold mb-2">Cliente</h2>
          <p className="text-sm text-gray-600">{customer.full_name}</p>
          <p className="text-sm text-gray-600">{customer.email} · {customer.phone}</p>

          <h2 className="font-bold mt-4 mb-2">Dirección de entrega</h2>
          <p className="text-sm text-gray-600">
            {customer.street}
            {customer.neighborhood ? `, ${customer.neighborhood}` : ""}
            <br />
            {customer.city}, {customer.state} {customer.zip_code}
            <br />
            {customer.country}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Cédula de cálculo</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>${Number(subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA ({Math.round((totals?.tax_rate ?? 0.16) * 100)}%)</span><span>${Number(tax).toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between font-extrabold text-lg border-t pt-3 mb-6">
            <span>Total</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
          <Link
            to="/Pago"
            className={`block text-center py-3 rounded-full font-bold text-white ${error ? "bg-gray-400 pointer-events-none" : "bg-[#334173]"}`}
          >
            Continuar a confirmar compra
          </Link>
          <Link to="/CheckoutPage" className="block text-center mt-3 text-sm text-[#334173] font-semibold">
            Editar datos
          </Link>
        </div>
      </div>
    </div>
  );
}


