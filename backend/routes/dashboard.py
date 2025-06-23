from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..models.database import get_db
from ..models.models import Product
from ..schemas.schemas import DashboardStats, BrandStats

router = APIRouter()

@router.get("/api/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Used by admin-dashboard.html to fetch dashboard statistics"""
    total_products = db.query(func.count(Product.id)).scalar()
    low_stock_count = db.query(func.count(Product.id)).filter(Product.quantity < 10).scalar()
    total_value = db.query(func.sum(Product.price * Product.quantity)).scalar() or 0

    return DashboardStats(
        total_products=total_products,
        low_stock_count=low_stock_count,
        total_inventory_value=total_value
    )

@router.get("/api/brands", response_model=List[BrandStats])
def get_brand_stats(db: Session = Depends(get_db)):
    """Used by admin-dashboard.html to fetch brand-wise product counts"""
    brand_stats = db.query(
        Product.brand,
        func.count(Product.id).label('count')
    ).group_by(Product.brand).all()

    return [BrandStats(brand=brand, count=count) for brand, count in brand_stats] 