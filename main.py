from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from sqlmodel import Session, select

from models import Product, engine

app = FastAPI()

@app.get("/inventory")
def get_inventory():
    with Session(engine) as session:
        return session.exec(select(Product)).all()


@app.delete("/inventory/{id}")
def delete_item(id: int):
    with Session(engine) as session:
        product = session.get(Product, id)
        if product is None:
            raise HTTPException(status_code=404, detail="Item not found")
        session.delete(product)
        session.commit()
        return {"ok": True, "id": id}

@app.post("/inventory")
def create_item(item: Product):
    with Session(engine) as session:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@app.put("/inventory/{id}")
def modify_item(id: int, item: Product):
    with Session(engine) as session:
        product = session.get(Product, id)
        if product is None:
            raise HTTPException(status_code=404, detail="Item not found")
        product.name = item.name
        product.sport = item.sport
        product.category = item.category
        product.quantity = item.quantity
        product.price = item.price
        product.supplier = item.supplier
        session.add(product)
        session.commit()
        session.refresh(product)
        return product


app.mount("/", StaticFiles(directory="static", html=True), name="static")