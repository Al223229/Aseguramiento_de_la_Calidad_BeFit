"""Initialize the local catalog database and insert sample data."""

from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.models.category import Category
from app.models.product import Product
import app.models  # noqa: F401 - register all catalog tables on Base.metadata


SAMPLE_PRODUCTS = [
    {
        "name": "Whey Protein Vainilla",
        "description": "Proteína de suero sabor vainilla para complementar tu entrenamiento.",
        "price": 799.00,
        "stock": 24,
        "category": "Proteínas",
        "image_url": "https://placehold.co/600x600?text=Whey+Vainilla",
    },
    {
        "name": "Whey Protein Chocolate",
        "description": "Mezcla de proteína de suero con sabor chocolate.",
        "price": 829.00,
        "stock": 18,
        "category": "Proteínas",
        "image_url": "https://placehold.co/600x600?text=Whey+Chocolate",
    },
    {
        "name": "Creatina Monohidratada",
        "description": "Creatina monohidratada en polvo para uso diario.",
        "price": 399.00,
        "stock": 35,
        "category": "Creatina",
        "image_url": "https://placehold.co/600x600?text=Creatina",
    },
    {
        "name": "Barras de Proteína",
        "description": "Paquete de barras de proteína para consumir como snack.",
        "price": 249.00,
        "stock": 12,
        "category": "Snacks",
        "image_url": "https://placehold.co/600x600?text=Barras+de+Proteina",
    },
    {
        "name": "Pre Entreno Cítrico",
        "description": "Mezcla en polvo sabor cítrico para antes del ejercicio.",
        "price": 549.00,
        "stock": 16,
        "category": "Pre-entreno",
        "image_url": "https://placehold.co/600x600?text=Pre+Entreno",
    },
    {
        "name": "Omega 3",
        "description": "Suplemento de aceite de pescado en cápsulas.",
        "price": 329.00,
        "stock": 28,
        "category": "Vitaminas",
        "image_url": "https://placehold.co/600x600?text=Omega+3",
    },
    {
        "name": "Multivitamínico Diario",
        "description": "Complejo de vitaminas y minerales para uso diario.",
        "price": 279.00,
        "stock": 21,
        "category": "Vitaminas",
        "image_url": "https://placehold.co/600x600?text=Multivitaminico",
    },
    {
        "name": "Shaker BeFit",
        "description": "Vaso mezclador reutilizable de 700 ml.",
        "price": 149.00,
        "stock": 40,
        "category": "Accesorios",
        "image_url": "https://placehold.co/600x600?text=Shaker",
    },
]


def init_db() -> None:
    """Create catalog tables and seed sample products without duplicating them."""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        category_ids = {}
        for category_name in sorted({item["category"] for item in SAMPLE_PRODUCTS}):
            category = db.scalar(
                select(Category).where(Category.name == category_name)
            )
            if category is None:
                category = Category(name=category_name)
                db.add(category)
                db.flush()
            category_ids[category_name] = category.id

        for item in SAMPLE_PRODUCTS:
            product = db.scalar(select(Product).where(Product.name == item["name"]))
            product_data = {
                **item,
                "category_id": category_ids[item["category"]],
                "brand": "BeFit",
                "is_active": True,
            }
            if product is None:
                db.add(Product(**product_data))
            else:
                for key, value in product_data.items():
                    setattr(product, key, value)

        db.commit()

    print(f"Base de datos inicializada. {len(SAMPLE_PRODUCTS)} productos de muestra disponibles.")


if __name__ == "__main__":
    init_db()
