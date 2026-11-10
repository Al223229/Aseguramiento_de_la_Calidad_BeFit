from typing import List, Optional, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product


class ProductService:
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.get(Product, product_id)

    @staticmethod
    def list_products(
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 12,
        is_active: Optional[bool] = True,
    ) -> Tuple[List[Product], int]:
        statement = select(Product)
        count_statement = select(func.count()).select_from(Product)

        filters = []
        if is_active is not None:
            filters.append(Product.is_active.is_(is_active))
        if query and query.strip():
            pattern = f"%{query.strip()}%"
            filters.append(Product.name.ilike(pattern))
        if category and category.strip():
            filters.append(
                or_(
                    Product.category.ilike(category.strip()),
                    Product.category_record.has(Category.name.ilike(category.strip())),
                )
            )

        if filters:
            statement = statement.where(*filters)
            count_statement = count_statement.where(*filters)

        total = db.scalar(count_statement) or 0
        products = list(
            db.scalars(
                statement.order_by(Product.name.asc()).offset(skip).limit(limit)
            ).all()
        )
        return products, total

    @staticmethod
    def list_categories(db: Session) -> List[str]:
        categories = db.scalars(select(Category.name).order_by(Category.name)).all()
        if categories:
            return list(categories)
        values = db.scalars(
            select(Product.category)
            .where(Product.is_active.is_(True), Product.category.is_not(None))
            .distinct()
            .order_by(Product.category)
        ).all()
        return [value for value in values if value]

    @staticmethod
    def get_related_products(db: Session, product_id: int, limit: int = 6) -> List[Product]:
        product = db.get(Product, product_id)
        if not product:
            return []
        return list(
            db.scalars(
                select(Product)
                .where(
                    Product.id != product_id,
                    Product.is_active.is_(True),
                    Product.category == product.category,
                )
                .order_by(Product.name.asc())
                .limit(limit)
            ).all()
        )


product_service = ProductService()
