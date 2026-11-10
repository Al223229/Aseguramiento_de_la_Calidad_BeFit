from typing import List, Optional

from pydantic import BaseModel, Field


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


class CheckoutValidateRequest(BaseModel):
    items: List[CartItemIn]


class CheckoutIssue(BaseModel):
    product_id: int
    product_name: Optional[str] = None
    issue: str
    requested: int
    available: int = 0


class CheckoutLine(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float
    stock: int
    subtotal: float
    image_path: Optional[str] = None


class CheckoutValidateResponse(BaseModel):
    valid: bool
    issues: List[CheckoutIssue]
    items: List[CheckoutLine]
    items_count: int
    subtotal: float
    tax_rate: float
    tax: float
    total: float
