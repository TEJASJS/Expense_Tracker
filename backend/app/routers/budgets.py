from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from ..models.models import Budget, User
from ..schemas.schemas import Budget as BudgetSchema, BudgetCreate, BudgetUpdate
from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=BudgetSchema, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new budget for the current user"""
    db_budget = Budget(
        **budget.dict(),
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.get("/", response_model=List[BudgetSchema])
def list_budgets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all budgets for the current user"""
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).offset(skip).limit(limit).all()
    return budgets

@router.get("/{budget_id}", response_model=BudgetSchema)
def get_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific budget by ID"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return db_budget

@router.put("/{budget_id}", response_model=BudgetSchema)
def update_budget(
    budget_id: uuid.UUID,
    budget_update: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a budget"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    update_data = budget_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_budget, field, value)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a budget"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(db_budget)
    db.commit()
    return None
