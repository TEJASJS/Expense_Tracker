from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..models.models import Expense, Wallet, User, wallet_shares
from ..schemas.schemas import Expense as ExpenseSchema, ExpenseCreate, ExpenseUpdate
from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter(
    tags=["expenses"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ExpenseSchema])
async def list_expenses(
    wallet_id: Optional[uuid.UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List expenses with optional filtering"""
    query = db.query(Expense)
    
    # Filter by wallet if provided
    if wallet_id is not None:
        # Verify wallet access
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        if wallet.owner_id != current_user.id and current_user.id not in [u.id for u in wallet.shared_with]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this wallet"
            )
        query = query.filter(Expense.wallet_id == wallet_id)
    
    # Apply additional filters
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if category:
        query = query.filter(Expense.category == category)
    
    # If a specific wallet isn't being queried, filter expenses to only those in wallets the user can access.
    if wallet_id is None:
        query = query.join(Wallet, Expense.wallet_id == Wallet.id)\
                     .outerjoin(wallet_shares, Wallet.id == wallet_shares.c.wallet_id)\
                     .filter(
                         (Wallet.owner_id == current_user.id) | 
                         (wallet_shares.c.user_id == current_user.id)
                     )
    
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new expense"""
    # Verify wallet access
    wallet = db.query(Wallet).filter(Wallet.id == expense.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet.owner_id != current_user.id and current_user.id not in [u.id for u in wallet.shared_with]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add expenses to this wallet"
        )
    
    # Create the expense
    db_expense = Expense(
        **expense.dict(),
        user_id=current_user.id
    )
    
    # Update wallet balance
    wallet.balance -= expense.amount
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/{expense_id}", response_model=ExpenseSchema)
async def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific expense by ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify access to the wallet this expense belongs to
    wallet = db.query(Wallet).filter(Wallet.id == expense.wallet_id).first()
    if not wallet or (wallet.owner_id != current_user.id and current_user.id not in [u.id for u in wallet.shared_with]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this expense"
        )
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseSchema)
async def update_expense(
    expense_id: uuid.UUID,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify access to the original wallet
    original_wallet = db.query(Wallet).filter(Wallet.id == db_expense.wallet_id).first()
    if not original_wallet or (original_wallet.owner_id != current_user.id and current_user.id not in [u.id for u in original_wallet.shared_with]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify an expense in this wallet"
        )

    # Only the user who created the expense can update it
    if db_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update this expense"
        )

    update_data = expense_update.dict(exclude_unset=True)
    
    # Handle wallet change
    if 'wallet_id' in update_data and update_data['wallet_id'] != db_expense.wallet_id:
        # Verify access to the new wallet
        new_wallet = db.query(Wallet).filter(Wallet.id == update_data['wallet_id']).first()
        if not new_wallet:
            raise HTTPException(status_code=404, detail="New wallet not found")
        if new_wallet.owner_id != current_user.id and current_user.id not in [u.id for u in new_wallet.shared_with]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to move an expense to the new wallet"
            )
        
        # Adjust balances
        original_wallet.balance += db_expense.amount
        new_wallet.balance -= update_data.get('amount', db_expense.amount)
    
    # Handle amount change in the same wallet
    elif 'amount' in update_data and update_data['amount'] != db_expense.amount:
        original_wallet.balance += db_expense.amount - update_data['amount']

    # Update the expense object
    for key, value in update_data.items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)
    db.refresh(original_wallet)
    if 'wallet_id' in update_data and update_data['wallet_id'] != db_expense.wallet_id:
        db.refresh(new_wallet)

    return db_expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify access to the wallet this expense belongs to
    wallet = db.query(Wallet).filter(Wallet.id == db_expense.wallet_id).first()
    if not wallet or (wallet.owner_id != current_user.id and current_user.id not in [u.id for u in wallet.shared_with]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this expense"
        )
    
    # Only the creator or wallet owner can delete the expense
    if db_expense.user_id != current_user.id and wallet.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator or wallet owner can delete this expense"
        )
    
    # Update wallet balance
    wallet.balance += db_expense.amount
    
    db.delete(db_expense)
    db.commit()
    return {"ok": True}
