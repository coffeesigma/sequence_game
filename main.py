from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

DB_FILE = "game_data.db"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        # 데이터 테이블 생성
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS game_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT NOT NULL,
                grid_size INTEGER NOT NULL,
                level INTEGER NOT NULL,
                error_rate FLOAT NOT NULL,
                run_time INTEGER NOT NULL
            )
        """)
        conn.commit()


# Pydantic 모델 정의
class TestResult(BaseModel):
    user_name: str
    grid_size: int
    level: int
    error_rate: float
    run_time: int


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Sequence Memory Game API"}


@app.post("/save")
async def save_test_data(data: List[TestResult]):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        for result in data:
            cursor.execute("""
                INSERT INTO game_results (user_name, grid_size, level, error_rate, run_time)
                VALUES (?, ?, ?, ?, ?)
            """, (result.user_name, result.grid_size, result.level, result.error_rate, result.run_time))
        conn.commit()

    # 응답 반환
    return {"message": "Data received successfully", "data": data}
