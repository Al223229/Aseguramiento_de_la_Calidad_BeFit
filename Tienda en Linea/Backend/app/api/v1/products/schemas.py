from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductListResponse(BaseModel):
    id: int
    product_id: int
    name: str
    description: str
    brand: str
    category: Optional[str] = None
    price: float
    stock: int
    average_rating: Optional[float] = None
    primary_image: Optional[str] = None
    image_url: Optional[str] = None


class ProductImageResponse(BaseModel):
    image_path: str
    is_primary: bool = True


class ProductResponse(ProductListResponse):
    category_id: Optional[int] = None
    is_active: bool
    product_images: List[ProductImageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductResponse(BaseModel):
    items: List[ProductListResponse]
    total: int
    page: int
    limit: int
    total_pages: int