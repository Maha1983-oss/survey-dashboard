
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import pandas as pd

app = FastAPI()

# Enable CORS for frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".xlsx"):
        return JSONResponse(status_code=400, content={"message": "Invalid file format. Only .xlsx allowed."})
    try:
        contents = await file.read()
        df = pd.read_excel(contents)
        return {"filename": file.filename, "columns": df.columns.tolist(), "rows": df.shape[0]}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
