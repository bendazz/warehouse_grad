from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel, create_engine


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    sport: str
    category: str
    quantity: int = 0
    price: float
    supplier: Optional[str] = None
    last_restocked: Optional[date] = None


sqlite_url = "sqlite:///warehouse.db"
engine = create_engine(sqlite_url, echo=False)
