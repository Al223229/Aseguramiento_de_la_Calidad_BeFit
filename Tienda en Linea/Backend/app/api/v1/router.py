from fastapi import APIRouter

from app.api.v1.categories.routes import router as categories_router
from app.api.v1.checkout.routes import router as checkout_router
from app.api.v1.products.routes import router as products_router

api_router = APIRouter()

api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(checkout_router, prefix="/checkout", tags=["Checkout"])
