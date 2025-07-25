from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..models.models import Wallet, User, wallet_shares
from ..schemas.schemas import Wallet as WalletSchema, WalletCreate, WalletAddBalance
from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter(
    tags=["wallets"],
    responses={404: {"description": "Not found"}},
)

def check_wallet_access(db: Session, wallet_id: uuid.UUID, user_id: uuid.UUID):
    """Check if user has access to the wallet"""
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Check if user is owner or has shared access
    if wallet.owner_id != user_id and user_id not in [u.id for u in wallet.shared_with]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this wallet"
        )
    return wallet

@router.get("/", response_model=List[WalletSchema])
async def list_wallets(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all wallets for the current user (owned and shared)"""
    # Query for wallets that are either owned by the user or shared with the user.
    query = db.query(Wallet).outerjoin(
        wallet_shares, Wallet.id == wallet_shares.c.wallet_id
    ).filter(
        (Wallet.owner_id == current_user.id) | (wallet_shares.c.user_id == current_user.id)
    ).distinct()

    wallets = query.offset(skip).limit(limit).all()
    return wallets

@router.post("/", response_model=WalletSchema, status_code=status.HTTP_201_CREATED)
async def create_wallet(
    wallet: WalletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new wallet"""
    db_wallet = Wallet(
        **wallet.dict(exclude={"shared_with"}),
        owner_id=current_user.id
    )
    
    # Add shared users if any
    if wallet.shared_with:
        shared_users = db.query(User).filter(
            User.id.in_(wallet.shared_with)
        ).all()
        db_wallet.shared_with = shared_users
    
    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet

@router.get("/{wallet_id}", response_model=WalletSchema)
async def get_wallet(
    wallet_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific wallet by ID"""
    wallet = check_wallet_access(db, wallet_id, current_user.id)
    return wallet

@router.post("/{wallet_id}/add_balance", response_model=WalletSchema)
async def add_balance_to_wallet(
    wallet_id: uuid.UUID,
    balance_data: WalletAddBalance,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add balance to a specific wallet."""
    db_wallet = check_wallet_access(db, wallet_id, current_user.id)

    if balance_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )

    db_wallet.balance += balance_data.amount
    db.commit()
    db.refresh(db_wallet)
    return db_wallet

@router.delete("/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wallet(
    wallet_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a wallet"""
    db_wallet = check_wallet_access(db, wallet_id, current_user.id)
    
    # Only owner can delete the wallet
    if db_wallet.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can delete this wallet"
        )
    
    db.delete(db_wallet)
    db.commit()
    return {"ok": True}
