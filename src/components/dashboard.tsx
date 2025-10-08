
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CalendarIcon,
  PlusCircle,
  DollarSign,
  Target,
  Bot,
  Loader2,
  Edit,
  Video,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { Transaction, SavingsGoal, Category } from "@/lib/types";
import { generateFinancialAdvice } from "@/ai/flows/generate-financial-advice";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "./ui/badge";
import { FinancialPlanner } from "./financial-planner";
import { LearnSection } from "./learn-section";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  category: z.string().min(1, "Category is required."),
  date: z.date(),
  description: z.string().min(1, "Description is required."),
});

const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required."),
  targetAmount: z.coerce.number().positive("Target amount must be positive."),
});

const budgetSchema = z.object({
  amount: z.coerce.number().positive("Budget must be positive."),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  type: z.enum(["income", "expense"]),
});


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const initialTransactions: Transaction[] = [
  { id: '1', type: 'income', category: 'Salary', amount: 4500, date: new Date(2023, 11, 1), description: 'Monthly Salary' },
  { id: '2', type: 'expense', category: 'Groceries', amount: 350, date: new Date(2023, 11, 5), description: 'Weekly grocery shopping' },
  { id: '3', type: 'expense', category: 'Rent', amount: 1500, date: new Date(2023, 11, 1), description: 'Monthly rent' },
  { id: '4', type: 'expense', category: 'Utilities', amount: 150, date: new Date(2023, 11, 10), description: 'Electricity and water bill' },
  { id: '5', type: 'expense', category: 'Entertainment', amount: 80, date: new Date(2023, 11, 15), description: 'Movie tickets' },
  { id: '6', type: 'expense', category: 'Transport', amount: 100, date: new Date(2023, 11, 1), description: 'Monthly bus pass' },
];

const initialGoals: SavingsGoal[] = [
    { id: '1', name: 'Vacation to Hawaii', targetAmount: 3000 },
    { id: '2', name: 'New Laptop', targetAmount: 1800 },
];

const initialCategories: Category[] = [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Groceries', type: 'expense' },
    { name: 'Rent', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Dining Out', type: 'expense' },
];

export function Dashboard({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [budget, setBudget] = useState<number>(3000);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);
  
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentTransactionsCard transactions={transactions} />
        <SpendingChartCard transactions={transactions} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1 grid gap-8">
            <AddTransactionCard
                categories={categories}
                onAddTransaction={(t) => setTransactions((prev) => [...prev, t])}
                onAddCategory={(c) => setCategories((prev) => [...prev, c])}
            />
        </div>
        <div className="lg:col-span-2">
            <SavingsGoalsCard goals={goals} onAddGoal={(g) => setGoals(prev => [...prev, g])} currentSavings={balance} />
        </div>
        <div className="lg:col-span-1 grid gap-8">
            <BudgetCard budget={budget} totalExpenses={totalExpenses} onSetBudget={setBudget} />
        </div>
      </div>
      
      <FinancialPlanner 
        categories={categories}
        onCategoriesChange={setCategories}
        language={language}
      />
      
      <LearnSection language={language} />

      <FinancialAdviceCard
        transactions={transactions}
        goals={goals}
        budget={budget}
        totalIncome={totalIncome}
      />
  </div>
  );
}

function OverviewCard({ totalIncome, totalExpenses, balance }: { totalIncome: number; totalExpenses: number; balance: number }) {
  return (
    <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">Your current available funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Total earnings this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total spending this period</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button size="sm" >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
                <Button size="sm" variant="outline">
                    <Target className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </CardContent>
        </Card>
    </>
  );
}

function AddTransactionCard({ categories, onAddTransaction, onAddCategory }: { categories: Category[], onAddTransaction: (t: Transaction) => void, onAddCategory: (c: Category) => void}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      date: new Date(),
      description: "",
      category: "",
    },
  });

  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    onAddTransaction({ ...values, id: crypto.randomUUID() });
    toast({
      title: "Transaction Added",
      description: `${formatCurrency(values.amount)} ${values.type} for ${values.category}.`,
    });
    form.reset();
    setOpen(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Log a new income or expense.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expense">Expense</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.filter(c => c.type === form.watch('type')).map(cat => (
                            <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                          <AddCategoryDialog onAddCategory={onAddCategory} type={form.watch('type')} >
                            <div className="flex w-full items-center p-2 text-sm text-primary cursor-pointer hover:bg-muted rounded-sm">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                            </div>
                          </AddCategoryDialog>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Coffee with friends" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function SpendingChartCard({ transactions }: { transactions: Transaction[] }) {
  const expenseData = useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);
  
  const chartConfig = {
    amount: {
      label: "Amount",
    },
    ...expenseData.reduce((acc, item) => {
      acc[item.name] = { label: item.name };
      return acc;
    }, {}),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
        <CardDescription>Your expenses by category.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <RechartsTooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
               <Legend/>
              <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index % 5 + 1}))`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No expense data to display.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetCard({ budget, totalExpenses, onSetBudget }: { budget: number, totalExpenses: number, onSetBudget: (b: number) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { amount: budget },
  });

  useEffect(() => {
    form.reset({ amount: budget });
  }, [budget, form]);

  const onSubmit = (values: z.infer<typeof budgetSchema>) => {
    onSetBudget(values.amount);
    toast({ title: "Budget Updated", description: `Your new monthly budget is ${formatCurrency(values.amount)}.` });
    setOpen(false);
  };

  const percentageSpent = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const remainingBudget = budget - totalExpenses;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget</CardTitle>
        <CardDescription>Your monthly spending limit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
          <span className="text-muted-foreground">/ {formatCurrency(budget)}</span>
        </div>
        <Progress value={percentageSpent} />
        <div className="text-sm text-muted-foreground">
          {remainingBudget >= 0 ? `${formatCurrency(remainingBudget)} remaining` : `${formatCurrency(Math.abs(remainingBudget))} over budget`}
        </div>
      </CardContent>
      <CardFooter>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Set Your Budget</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Budget</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Set Budget</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
      </CardFooter>
    </Card>
  );
}

function SavingsGoalsCard({ goals, onAddGoal, currentSavings }: { goals: SavingsGoal[], onAddGoal: (g: SavingsGoal) => void, currentSavings: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof savingsGoalSchema>>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: { name: "", targetAmount: 0 },
  });

  const onSubmit = (values: z.infer<typeof savingsGoalSchema>) => {
    onAddGoal({ ...values, id: crypto.randomUUID() });
    toast({ title: "Goal Added", description: `You're now saving for ${values.name}!` });
    form.reset();
    setOpen(false);
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target /> Savings Goals</CardTitle>
        <CardDescription>Track progress towards your financial targets.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {goals.length > 0 ? goals.map(goal => {
          const progress = currentSavings > 0 ? (currentSavings / goal.targetAmount) * 100 : 0;
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.name}</span>
                <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
              </div>
              <Progress value={Math.min(progress, 100)} />
              <div className="text-xs text-muted-foreground text-right">{Math.min(progress, 100).toFixed(0)}% complete</div>
            </div>
          )
        }) : (
           <div className="flex h-full items-center justify-center text-muted-foreground">
            No savings goals yet. Add one!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Savings Goal</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl><Input placeholder="e.g., New car" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 20000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Add Goal</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function FinancialAdviceCard({ transactions, goals, budget, totalIncome }: { transactions: Transaction[], goals: SavingsGoal[], budget: number, totalIncome: number }) {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    setAdvice("");
    try {
      const spendingHabits = transactions
        .filter(t => t.type === 'expense')
        .map(t => `- ${formatCurrency(t.amount)} on ${t.category} (${t.description})`)
        .join('\n');
      
      const savingsGoals = goals
        .map(g => `- Save ${formatCurrency(g.targetAmount)} for ${g.name}`)
        .join('\n');

      const result = await generateFinancialAdvice({
        spendingHabits: spendingHabits || "No expenses recorded.",
        savingsGoals: savingsGoals || "No savings goals set.",
        income: totalIncome,
        budget,
      });

      setAdvice(result.advice);
    } catch (error) {
      console.error("Failed to generate advice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate financial advice. Please try again later.",
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> AI Financial Advisor</CardTitle>
        <CardDescription>Get personalized advice based on your financial data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {advice && (
          <Alert>
            <AlertTitle>Your Personalized Advice</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">{advice}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !advice && (
          <div className="text-center text-muted-foreground p-4">
            Click the button to get started!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateAdvice} disabled={isLoading} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Generate Advice"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RecentTransactionsCard({ transactions }: { transactions: Transaction[]}) {
  const recentTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <Card>
       <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your last 5 transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <ul className="space-y-4">
            {recentTransactions.map(t => (
              <li key={t.id} className="flex items-center">
                <div className="flex-shrink-0">
                  {t.type === 'income' ? <ArrowUpCircle className="h-6 w-6 text-green-500" /> : <ArrowDownCircle className="h-6 w-6 text-red-500" />}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-muted-foreground">{t.category} &bull; {format(t.date, 'MMM d, yyyy')}</p>
                </div>
                <div className={cn("font-semibold", t.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No transactions yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddCategoryDialog({ onAddCategory, type, children }: { onAddCategory: (c: Category) => void; type: 'income' | 'expense', children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof categorySchema>>({
      resolver: zodResolver(categorySchema),
      defaultValues: { name: "", type },
    });
  
    useEffect(() => {
      form.setValue('type', type);
    }, [type, form]);
  
    const onSubmit = (values: z.infer<typeof categorySchema>) => {
      onAddCategory(values);
      toast({ title: 'Category Added', description: `New ${values.type} category "${values.name}" created.` });
      form.reset();
      setOpen(false);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Side Hustle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
