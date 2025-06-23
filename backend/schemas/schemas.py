from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models.models import UserRole

class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    sku: str
    brand: str
    price: float
    quantity: int
    supplier: str
    category: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    role: Optional[str] = None
    message: Optional[str] = None

class DashboardStats(BaseModel):
    total_products: int
    low_stock_count: int
    total_inventory_value: float

class BrandStats(BaseModel):
    brand: str
    count: int

class Token(BaseModel):
    access_token: str
    token_type: str 