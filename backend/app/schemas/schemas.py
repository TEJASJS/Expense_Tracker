from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Union
from datetime import datetime, date
from uuid import UUID

# Base schemas
class WalletBase(BaseModel):
    name: str
    type: str = "personal"
    description: Optional[str] = None
    currency: str = "INR"
    balance: float = 0.0
    shared_with: List[UUID] = Field(default_factory=list)

class ExpenseBase(BaseModel):
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None
    wallet_id: UUID
    date: Optional[datetime] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Request schemas
class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WalletCreate(WalletBase):
    pass

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    wallet_id: Optional[UUID] = None
    date: Optional[datetime] = None

class WalletAddBalance(BaseModel):
    amount: float

# Goal schemas
class GoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0, description="Target amount must be greater than 0")
    current_amount: float = Field(0.0, ge=0, description="Current amount cannot be negative")
    deadline: Optional[Union[datetime, date]] = None
    category: Optional[str] = None
    is_completed: bool = False

class GoalCreate(GoalBase):
    pass

class GoalAddFunds(BaseModel):
    amount: float
    wallet_id: UUID

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0, description="Target amount must be greater than 0")
    current_amount: Optional[float] = Field(None, ge=0, description="Current amount cannot be negative")
    deadline: Optional[Union[datetime, date]] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None

# Response schemas
class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Wallet(WalletBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Expense(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Goal(GoalBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @validator('deadline', pre=True)
    def parse_deadline(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                pass
        return v

    class Config:
        from_attributes = True

# Budget schemas
class BudgetBase(BaseModel):
    category: str
    amount: float
    start_date: datetime
    end_date: datetime

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Budget(BudgetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
