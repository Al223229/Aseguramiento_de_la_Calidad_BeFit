from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.checkout.schemas import (
    CheckoutIssue,
    CheckoutLine,
    CheckoutValidateRequest,
    CheckoutValidateResponse,
)
from app.config import settings
from app.models.product import Product

router = APIRouter()

TWO_PLACES = Decimal("0.01")


def _money(value: Decimal) -> float:
    return float(value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP))


def _primary_image(product: Product) -> str | None:
    return product.image_url


@router.post("/validate", response_model=CheckoutValidateResponse)
def validate_checkout_cart(
    payload: CheckoutValidateRequest,
    db: Session = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito está vacío",
        )

    issues: list[CheckoutIssue] = []
    lines: list[CheckoutLine] = []
    subtotal = Decimal("0.00")

    for item in payload.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if not product or not product.is_active:
            issues.append(
                CheckoutIssue(
                    product_id=item.product_id,
                    product_name=product.name if product else None,
                    issue="Producto no disponible",
                    requested=item.quantity,
                    available=0,
                )
            )
            continue

        if product.stock < item.quantity:
            issues.append(
                CheckoutIssue(
                    product_id=product.id,
                    product_name=product.name,
                    issue="Stock insuficiente",
                    requested=item.quantity,
                    available=product.stock,
                )
            )
            continue

        line_subtotal = Decimal(str(product.price)) * item.quantity
        subtotal += line_subtotal
        lines.append(
            CheckoutLine(
                product_id=product.id,
                name=product.name,
                quantity=item.quantity,
                price=float(product.price),
                stock=product.stock,
                subtotal=_money(line_subtotal),
                image_path=_primary_image(product),
            )
        )

    tax_rate = Decimal(str(settings.TAX_RATE))
    tax = subtotal * tax_rate
    total = subtotal + tax

    return CheckoutValidateResponse(
        valid=len(issues) == 0,
        issues=issues,
        items=lines,
        items_count=sum(line.quantity for line in lines),
        subtotal=_money(subtotal),
        tax_rate=float(tax_rate),
        tax=_money(tax),
        total=_money(total),
    )


