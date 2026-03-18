import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

/**
 * Aggregates transactions by category for a donut chart.
 */
export const getCategoryData = (transactions) => {
  const categories = {};

  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (!t.amount || isNaN(parseFloat(t.amount))) return;
    // Reports.jsx uses non-aliased joins so joined data key is 'categories' (table name)
    const categoryName = t.categories?.name || t.category?.name || 'Uncategorized';
    categories[categoryName] = (categories[categoryName] || 0) + parseFloat(t.amount);
  });

  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);
};

/**
 * Aggregates income vs expenses over time for an area chart.
 * Defaults to current month if no range provided.
 */
export const getTrendData = (transactions, startDate, endDate) => {
  const start = startDate || startOfMonth(new Date());
  const end = endDate || endOfMonth(new Date());

  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const dayTransactions = transactions.filter(t => {
      if (!t.transaction_date) return false;
      try { return isSameDay(parseISO(t.transaction_date), day); } catch { return false; }
    });

    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      date: format(day, 'MMM dd'),
      income,
      expense
    };
  });
};

/**
 * Calculates summary statistics (Total Income, Total Expense, Net Cash Flow).
 */
export const getReportSummary = (transactions) => {
  const income = transactions
    .filter(t => t.type === 'income' && t.amount && !isNaN(parseFloat(t.amount)))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'expense' && t.amount && !isNaN(parseFloat(t.amount)))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return {
    income,
    expense,
    net: income - expense
  };
};
