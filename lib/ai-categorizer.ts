// AI-powered expense categorization
export const aiCategorizer = {
  categorizeExpense: (description: string): string => {
    const desc = description.toLowerCase();
    
    // Food & dining keywords
    if (desc.includes('restaurant') || desc.includes('food') || desc.includes('lunch') || 
        desc.includes('dinner') || desc.includes('cafe') || desc.includes('coffee') ||
        desc.includes('pizza') || desc.includes('burger') || desc.includes('meal')) {
      return 'Food & Dining';
    }
    
    // Transportation keywords
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || 
        desc.includes('taxi') || desc.includes('bus') || desc.includes('metro') ||
        desc.includes('train') || desc.includes('parking') || desc.includes('car')) {
      return 'Transportation';
    }
    
    // Shopping keywords
    if (desc.includes('shop') || desc.includes('store') || desc.includes('buy') ||
        desc.includes('purchase') || desc.includes('amazon') || desc.includes('clothes') ||
        desc.includes('shoes') || desc.includes('electronics')) {
      return 'Shopping';
    }
    
    // Entertainment keywords
    if (desc.includes('movie') || desc.includes('cinema') || desc.includes('concert') ||
        desc.includes('game') || desc.includes('entertainment') || desc.includes('netflix') ||
        desc.includes('spotify') || desc.includes('youtube')) {
      return 'Entertainment';
    }
    
    // Bills & utilities keywords
    if (desc.includes('bill') || desc.includes('electricity') || desc.includes('water') ||
        desc.includes('internet') || desc.includes('phone') || desc.includes('utility') ||
        desc.includes('insurance') || desc.includes('rent') || desc.includes('mortgage')) {
      return 'Bills & Utilities';
    }
    
    // Healthcare keywords
    if (desc.includes('doctor') || desc.includes('hospital') || desc.includes('medicine') ||
        desc.includes('pharmacy') || desc.includes('health') || desc.includes('medical') ||
        desc.includes('dentist') || desc.includes('clinic')) {
      return 'Healthcare';
    }
    
    // Travel keywords
    if (desc.includes('flight') || desc.includes('hotel') || desc.includes('travel') ||
        desc.includes('vacation') || desc.includes('trip') || desc.includes('airbnb') ||
        desc.includes('booking') || desc.includes('ticket')) {
      return 'Travel';
    }
    
    return 'Other';
  },

  suggestBudget: (category: string, expenses: number[]): number => {
    if (expenses.length === 0) return 0;
    
    const average = expenses.reduce((sum, exp) => sum + exp, 0) / expenses.length;
    const maxExpense = Math.max(...expenses);
    
    // Suggest budget with 20% buffer above average, but consider max expense
    const suggestedBudget = Math.max(average * 1.2, maxExpense * 1.1);
    
    // Round to nearest 50 for cleaner numbers
    return Math.ceil(suggestedBudget / 50) * 50;
  },

  generateSavingsTips: (expenses: any[], budgets: any[]): string[] => {
    const tips: string[] = [];
    
    // Analyze spending patterns and generate tips
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number));
    
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0][0];
      const topAmount = sortedCategories[0][1] as number;
      
      tips.push(`Your highest spending category is ${topCategory} ($${topAmount.toFixed(2)}). Consider setting a budget for this category.`);
    }
    
    // Check for budget overruns
    budgets.forEach(budget => {
      const spent = categoryTotals[budget.category] || 0;
      if (spent > budget.amount) {
        tips.push(`You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}. Try to reduce spending in this area.`);
      }
    });
    
    // General tips
    tips.push('Track your daily expenses to identify spending patterns.');
    tips.push('Consider using the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');
    tips.push('Review and cancel unused subscriptions to save money.');
    
    return tips.slice(0, 5); // Return top 5 tips
  }
};