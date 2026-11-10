import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { validateCheckoutCart } from "../utils/api";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  country: "México",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems } = useOutletContext();
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("checkoutCustomer");
      return saved ? { ...emptyForm, ...JSON.parse(saved) } : emptyForm;
    } catch {
      return emptyForm;
    }
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("checkoutCustomer", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (!cartItems.length) navigate("/CartPage");
  }, [cartItems, navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.full_name.trim() || form.full_name.trim().length < 3) {
      setError("Ingresa el nombre completo del cliente.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      setError("Ingresa un teléfono de al menos 10 dígitos.");
      return;
    }
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zip_code.trim()) {
      setError("Completa la dirección de entrega (calle, ciudad, estado y código postal).");
      return;
    }

    try {
      setLoading(true);
      const validation = await validateCheckoutCart(cartItems);
      if (!validation.valid) {
        const first = validation.issues[0];
        setError(
          first
            ? `${first.product_name || "Producto"}: ${first.issue} (disponible: ${first.available})`
            : "Hay productos sin stock suficiente."
        );
        return;
      }
      localStorage.setItem("checkoutCustomer", JSON.stringify(form));
      localStorage.setItem("checkoutTotals", JSON.stringify(validation));
      navigate("/Resumen");
    } catch (err) {
      setError(err.message || "No se pudo validar el carrito.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#334173]";

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Paso 1 de 3</p>
        <h1 className="text-2xl font-extrabold text-[#334173] mb-2">Datos del cliente y envío</h1>
        <p className="text-gray-500 text-sm mb-6">
          Captura los datos necesarios para revisar tu compra y entrega.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className={fieldClass} name="full_name" placeholder="Nombre completo" value={form.full_name} onChange={onChange} />
            <input className={fieldClass} name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={onChange} />
            <input className={fieldClass} name="phone" placeholder="Teléfono" value={form.phone} onChange={onChange} />
            <input className={fieldClass} name="street" placeholder="Calle y número" value={form.street} onChange={onChange} />
            <input className={fieldClass} name="neighborhood" placeholder="Colonia (opcional)" value={form.neighborhood} onChange={onChange} />
            <input className={fieldClass} name="city" placeholder="Ciudad" value={form.city} onChange={onChange} />
            <input className={fieldClass} name="state" placeholder="Estado" value={form.state} onChange={onChange} />
            <input className={fieldClass} name="zip_code" placeholder="Código postal" value={form.zip_code} onChange={onChange} />
            <input className={fieldClass} name="country" placeholder="País" value={form.country} onChange={onChange} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/CartPage" className="flex-1 text-center border border-[#334173] text-[#334173] py-3 rounded-full font-bold">
              Volver al carrito
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#334173] text-white py-3 rounded-full font-bold disabled:opacity-60"
            >
              {loading ? "Validando stock..." : "Continuar al resumen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
