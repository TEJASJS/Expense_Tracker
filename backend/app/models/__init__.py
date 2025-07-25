# Import models here to make them available when importing from app.models
# This helps avoid circular imports
from ..core.database import Base
from .models import User, Wallet, Expense, wallet_shares

# This makes these available when importing from app.models
__all__ = ['Base', 'User', 'Wallet', 'Expense', 'wallet_shares']
