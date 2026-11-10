from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    brand: Mapped[str] = mapped_column(String(100), nullable=False, default="BeFit")
    average_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(2, 1), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    category_record: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="products"
    )

    @property
    def product_id(self) -> int:
        """Compatibility alias used by the existing frontend catalog."""
        return self.id

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name={self.name!r})>"
