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
def create_item()


app.mount("/", StaticFiles(directory="static", html=True), name="static")