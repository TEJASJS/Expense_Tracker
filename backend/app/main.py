from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
import os
from dotenv import load_dotenv
from app.core.database import init_db

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Expense Tracker API",
    description="Backend API for Expense Tracker application",
    version="1.0.0"
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Expense Tracker API"}

# Import and include routers
from app.routers import auth, wallets, expenses, goals, budgets

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(wallets.router, prefix="/api/wallets", tags=["Wallets"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
