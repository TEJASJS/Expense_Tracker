'use client';

import { Goal } from '@/types/goal';
import { Expense } from '@/types/expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GoalsViewProps {
  goals: Goal[];
  expenses: Expense[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalsView({ goals, expenses, onAddGoal, onUpdateGoal, onDeleteGoal }: GoalsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <Button>Add Goal</Button>
      </div>
      
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
                      <div className="font-medium">{goal.name}</div>
                      <p className="text-sm text-muted-foreground">
                        Target Date: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No date set'}
                      </p>
                    </div>
                    <div className="text-sm">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </div>
                  </div>
                  <Progress value={percentage} className="mb-2" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Add Funds</Button>
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