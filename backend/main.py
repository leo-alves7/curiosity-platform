from fastapi import FastAPI


app = FastAPI()


@app.get("/stores")
def get_stores():
    return [
        {"id": 1, "name": "Loja Exemplo", "lat": -23.5505, "lng": -46.6333},
    ]
