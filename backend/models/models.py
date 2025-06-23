from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password = Column(String(255))  # Will store hashed password
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    sku = Column(String(50), unique=True, index=True)
    brand = Column(String(50), index=True)
    price = Column(Float)
    quantity = Column(Integer)
    supplier = Column(String(100))
    category = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 