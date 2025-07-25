'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/goal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSubmitAction: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onCancelAction: () => void;
  isSubmitting: boolean;
}

export function GoalForm({ initialData, onSubmitAction, onCancelAction, isSubmitting }: GoalFormProps) {
  const [formData, setFormData] = useState<Omit<Goal, 'id'>>({
    name: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString(),
    category: 'Other',
    isCompleted: false,
    userId: 'current-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        targetAmount: initialData.targetAmount || 0,
        currentAmount: initialData.currentAmount || 0,
        deadline: initialData.deadline || new Date().toISOString(),
        category: initialData.category || 'Other',
        isCompleted: initialData.isCompleted || false,
        userId: initialData.userId || 'current-user',
        createdAt: initialData.createdAt || new Date().toISOString(),
        updatedAt: initialData.updatedAt || new Date().toISOString(),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetAmount' || name === 'currentAmount' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: Omit<Goal, 'id'> = {
      ...formData,
      deadline: formData.deadline,
      createdAt: formData.createdAt,
      updatedAt: new Date().toISOString(),
      userId: formData.userId
    };
    await onSubmitAction(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., New Laptop"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your goal..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount ($)</Label>
          <Input
            id="targetAmount"
            name="targetAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.targetAmount || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current Amount ($)</Label>
          <Input
            id="currentAmount"
            name="currentAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.currentAmount || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.deadline ? (
                format(new Date(formData.deadline), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.deadline ? new Date(formData.deadline) : undefined}
              onSelect={(date) => {
                setFormData(prev => ({
                  ...prev,
                  deadline: date ? date.toISOString() : undefined
                }));
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelAction}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Goal'}
        </Button>
      </div>
    </form>
  );
}
