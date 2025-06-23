from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models.models import Product
from ..schemas.schemas import Product as ProductSchema, ProductCreate

router = APIRouter()

@router.get("/api/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    """Used by products.html to fetch all products"""
    return db.query(Product).all()

@router.post("/api/products", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Used by admin-dashboard.html to add new products"""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Used by admin-dashboard.html to delete products"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"} 