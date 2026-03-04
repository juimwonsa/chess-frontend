from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analysis import ChessAnalyzer
import uvicorn

app = FastAPI()

# 프론트엔드(포트 3000)와의 통신 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 개발 중에는 모두 허용, 필요시 특정 IP로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    pgn: str
    depth: int = 12

analyzer = ChessAnalyzer()

@app.get("/")
def read_root():
    return {"message": "Chess Analysis Server is running"}

@app.post("/analyze")
async def analyze_game(request: AnalysisRequest):
    if not request.pgn:
        raise HTTPException(status_code=400, detail="PGN is required")
    
    results = await analyzer.analyze_game(request.pgn, request.depth)
    if isinstance(results, dict) and "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])
        
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
