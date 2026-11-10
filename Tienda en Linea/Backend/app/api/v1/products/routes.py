import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.products import schemas
from app.api.v1.products.service import ProductService
from app.models.product import Product

router = APIRouter()


def _list_response(product: Product) -> schemas.ProductListResponse:
    image_url = product.image_url
    return schemas.ProductListResponse(
        id=product.id,
        product_id=product.id,
        name=product.name,
        description=product.description,
        brand=product.brand,
        category=product.category,
        price=float(product.price),
        stock=product.stock,
        average_rating=float(product.average_rating) if product.average_rating is not None else None,
        primary_image=image_url,
        image_url=image_url,
    )


def _detail_response(product: Product) -> schemas.ProductResponse:
    image = (
        [{"image_path": product.image_url, "is_primary": True}]
        if product.image_url
        else []
    )
    return schemas.ProductResponse(
        **_list_response(product).model_dump(),
        category_id=product.category_id,
        is_active=product.is_active,
        product_images=image,
    )


@router.get("/", response_model=schemas.PaginatedProductResponse)
def list_products(
    query: Optional[str] = Query(None, description="Buscar por nombre"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
):
    products, total = ProductService.list_products(
        db=db,
        query=query,
        category=category,
        skip=(page - 1) * limit,
        limit=limit,
        is_active=is_active,
    )
    return schemas.PaginatedProductResponse(
        items=[_list_response(product) for product in products],
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total else 0,
    )


@router.get("/{product_id}/related", response_model=list[schemas.ProductListResponse])
def get_related_products(
    product_id: int,
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    return [_list_response(product) for product in ProductService.get_related_products(db, product_id, limit)]


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado",
        )
    return _detail_response(product)
