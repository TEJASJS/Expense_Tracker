from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from ..models.models import Goal, User, Wallet
from ..schemas.schemas import Goal as GoalSchema, GoalCreate, GoalUpdate, GoalAddFunds
from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=GoalSchema, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new goal for the current user"""
    db_goal = Goal(
        **goal.dict(),
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[GoalSchema])
def list_goals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all goals for the current user"""
    goals = db.query(Goal)\
        .filter(Goal.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return goals

@router.get("/{goal_id}", response_model=GoalSchema)
def get_goal(
    goal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific goal by ID"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return db_goal

@router.put("/{goal_id}", response_model=GoalSchema)
def update_goal(
    goal_id: uuid.UUID,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a goal"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a goal"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(db_goal)
    db.commit()
    return None

@router.post("/{goal_id}/add_funds", response_model=GoalSchema)
def add_funds_to_goal(
    goal_id: uuid.UUID,
    fund_data: GoalAddFunds,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add funds to a goal from a wallet"""
    # Get the goal
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    if db_goal.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This goal has already been completed."
        )

    # Get the wallet
    db_wallet = db.query(Wallet).filter(
        Wallet.id == fund_data.wallet_id,
        Wallet.owner_id == current_user.id
    ).first()
    if not db_wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found or you do not have access to it"
        )

    # Check for sufficient funds
    if db_wallet.balance < fund_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds in the wallet"
        )

    # Perform the transaction
    db_wallet.balance -= fund_data.amount
    db_goal.current_amount += fund_data.amount
    db_goal.updated_at = datetime.utcnow()

    # Check if the goal is completed
    if db_goal.current_amount >= db_goal.target_amount:
        db_goal.is_completed = True

    db.commit()
    db.refresh(db_goal)
    db.refresh(db_wallet)

    return db_goal
