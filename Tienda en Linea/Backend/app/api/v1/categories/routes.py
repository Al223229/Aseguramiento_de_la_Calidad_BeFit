from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.products.service import ProductService

router = APIRouter()


@router.get("")
@router.get("/")
def list_categories(db: Session = Depends(get_db)):
    categories = ProductService.list_categories(db)
    return {"categories": categories}


