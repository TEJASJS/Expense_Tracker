'use client';

import { useState } from 'react';
import { Goal } from '@/types/goal';
import { Wallet } from '@/types/wallet';
import { Expense } from '@/types/expense';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GoalForm } from './GoalForm';
import { Badge } from '@/components/ui/badge';

interface GoalsViewProps {
  goals: Goal[];
  wallets: Wallet[];
  expenses: Expense[];
  onAddGoalAction: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoalAction: (goal: Goal) => Promise<void>;
  onDeleteGoalAction: (id: string) => Promise<void>;
  onAddFundsAction: (goalId: string, amount: number, walletId: string) => Promise<void>;
}

export function GoalsView({ 
  goals, 
  wallets,
  expenses, 
  onAddGoalAction: onAddGoal, 
  onUpdateGoalAction: onUpdateGoal, 
  onDeleteGoalAction: onDeleteGoal, 
  onAddFundsAction
}: GoalsViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showFundingDialog, setShowFundingDialog] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingWalletId, setFundingWalletId] = useState<string | undefined>();
  const [currentFundingGoal, setCurrentFundingGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGoal = async (goalData: Omit<Goal, 'id'>) => {
    setIsSubmitting(true);
    try {
      await onAddGoal(goalData);
      setShowAddDialog(false);
      toast.success('Goal added successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add goal';
      toast.error(errorMessage);
      console.error('Add goal error:', error);
      throw error; // Re-throw to allow form to handle submission state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (goalData: Omit<Goal, 'id'>) => {
    if (!editingGoal) return;
    
    setIsSubmitting(true);
    try {
      await onUpdateGoal({
        ...editingGoal,
        ...goalData,
        id: editingGoal.id
      });
      setEditingGoal(null);
      toast.success('Goal updated successfully!');
    } catch (error) {
      toast.error('Failed to update goal');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await onDeleteGoal(id);
        toast.success('Goal deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete goal');
        console.error(error);
      }
    }
  };

  const handleAddFunds = (goal: Goal) => {
    setCurrentFundingGoal(goal);
    setFundingAmount('');
    setShowFundingDialog(true);
  };

    const handleSubmitFunding = async () => {
    if (!currentFundingGoal || !fundingWalletId) {
      toast.error('Please select a goal and a wallet.');
      return;
    }

    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddFundsAction(currentFundingGoal.id, amount, fundingWalletId);
      
      setShowFundingDialog(false);
      setCurrentFundingGoal(null);
      setFundingAmount('');
      setFundingWalletId(undefined);
      toast.success('Funds added successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add funds';
      toast.error(errorMessage);
      console.error('Funding error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <Button onClick={() => {
          setEditingGoal(null);
          setShowAddDialog(true);
        }}>
          Add Goal
        </Button>
      </div>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showAddDialog || !!editingGoal} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingGoal(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]" aria-labelledby="add-goal-title" aria-describedby="add-goal-description">
          <DialogHeader>
            <DialogTitle id="add-goal-title">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
            <p id="add-goal-description" className="text-sm text-muted-foreground">
              Set a new financial goal to track your progress.
            </p>
          </DialogHeader>
          <GoalForm
            initialData={editingGoal || undefined}
            onSubmitAction={editingGoal ? handleUpdate : handleAddGoal}
            onCancelAction={() => {
              setShowAddDialog(false);
              setEditingGoal(null);
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={showFundingDialog} onOpenChange={setShowFundingDialog}>
        <DialogContent className="sm:max-w-[425px]" aria-labelledby="add-funds-title">
          <DialogHeader>
            <DialogTitle id="add-funds-title">Add Funds to {currentFundingGoal?.name}</DialogTitle>
            <DialogDescription>
              Select a wallet and enter the amount you want to add to this goal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fundingAmount">Amount to Add</Label>
              <Input
                id="fundingAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundingWallet">From Wallet</Label>
              <Select onValueChange={setFundingWalletId} value={fundingWalletId} disabled={isSubmitting}>
                <SelectTrigger id="fundingWallet">
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} (₹{wallet.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFundingDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSubmitFunding}
                disabled={!fundingAmount || !fundingWalletId || isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Funds'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {goals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No savings goals set. Add your first goal to start tracking your progress.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            
            return (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                                            <div className="flex items-center gap-2">
                        <div className="font-medium">{goal.name}</div>
                        {goal.isCompleted && <Badge variant="secondary">Completed</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target Date: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No date set'}
                      </p>
                    </div>
                    <div className="text-sm">
                      ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                    </div>
                  </div>
                  <Progress value={percentage} className="mb-2" />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingGoal(goal)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddFunds(goal)}
                      disabled={goal.isCompleted}
                    >
                      Add Funds
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}