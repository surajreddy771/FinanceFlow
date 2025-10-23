
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  PlusCircle,
  Target,
  Bot,
  Loader2,
  Edit,
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
  DialogFooter,
  DialogDescription,
  DialogTrigger,
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
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);

const initialData = {
    en: {
        transactions: [
            { id: '1', type: 'income', category: 'Crop Sale', amount: 75000, date: new Date(2023, 10, 15), description: 'Wheat harvest sale' },
            { id: '2', type: 'income', category: 'Livestock Sale', amount: 15000, date: new Date(2023, 10, 20), description: 'Sale of two goats' },
            { id: '3', type: 'expense', category: 'Fertilizer', amount: 10000, date: new Date(2023, 11, 5), description: 'Fertilizer for next season' },
            { id: '4', type: 'expense', category: 'Household', amount: 5000, date: new Date(2023, 11, 2), description: 'Monthly household supplies' },
            { id: '5', type: 'expense', category: 'Loan Repayment', amount: 8000, date: new Date(2023, 11, 10), description: 'KCC loan installment' },
            { id: '6', type: 'expense', category: 'Education', amount: 3000, date: new Date(2023, 11, 1), description: 'Children\'s school fees' },
        ],
        goals: [
            { id: '1', name: 'Buy a Tractor', targetAmount: 500000 },
            { id: '2', name: 'Daughter\'s Wedding', targetAmount: 200000 },
        ],
        categories: [
            { name: 'Crop Sale', type: 'income' },
            { name: 'Livestock Sale', type: 'income' },
            { name: 'Govt. Scheme', type: 'income' },
            { name: 'Fertilizer', type: 'expense' },
            { name: 'Seeds', type: 'expense' },
            { name: 'Loan Repayment', type: 'expense' },
            { name: 'Household', type: 'expense' },
            { name: 'Education', type: 'expense' },
            { name: 'Health', type: 'expense' },
        ]
    },
    hi: {
        transactions: [
            { id: '1', type: 'income', category: 'फसल बिक्री', amount: 75000, date: new Date(2023, 10, 15), description: 'गेहूं की फसल की बिक्री' },
            { id: '2', type: 'income', category: 'पशुधन बिक्री', amount: 15000, date: new Date(2023, 10, 20), description: 'दो बकरियों की बिक्री' },
            { id: '3', type: 'expense', category: 'उर्वरक', amount: 10000, date: new Date(2023, 11, 5), description: 'अगले सीजन के लिए उर्वरक' },
            { id: '4', type: 'expense', category: 'घरेलू', amount: 5000, date: new Date(2023, 11, 2), description: 'मासिक घरेलू आपूर्ति' },
            { id: '5', type: 'expense', category: 'ऋण चुकौती', amount: 8000, date: new Date(2023, 11, 10), description: 'केसीसी ऋण किस्त' },
            { id: '6', type: 'expense', category: 'शिक्षा', amount: 3000, date: new Date(2023, 11, 1), description: 'बच्चों की स्कूल फीस' },
        ],
        goals: [
            { id: '1', name: 'ट्रैक्टर खरीदें', targetAmount: 500000 },
            { id: '2', name: 'बेटी की शादी', targetAmount: 200000 },
        ],
        categories: [
            { name: 'फसल बिक्री', type: 'income' },
            { name: 'पशुधन बिक्री', type: 'income' },
            { name: 'सरकारी योजना', type: 'income' },
            { name: 'उर्वरक', type: 'expense' },
            { name: 'बीज', type: 'expense' },
            { name: 'ऋण चुकौती', type: 'expense' },
            { name: 'घरेलू', type: 'expense' },
            { name: 'शिक्षा', type: 'expense' },
            { name: 'स्वास्थ्य', type: 'expense' },
        ]
    }
}

const translations = {
  en: {
    totalBalance: "Total Balance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    addTransaction: "Add Transaction",
    addGoal: "Add Goal",
    newTransaction: "New Transaction",
    expense: "Expense",
    income: "Income",
    amount: "Amount",
    category: "Category",
    selectCategory: "Select a category",
    addNewCategory: "Add New Category",
    description: "Description",
    descriptionPlaceholder: "e.g., Sale of produce",
    date: "Date",
    pickDate: "Pick a date",
    transactionAdded: "Transaction Added",
    budget: "Budget",
    monthlySpendingLimit: "Your monthly spending limit.",
    remaining: "remaining",
    overBudget: "over budget",
    editBudget: "Edit Budget",
    setYourBudget: "Set Your Budget",
    monthlyBudget: "Monthly Budget",
    budgetPlaceholder: "e.g., 20000",
    setBudget: "Set Budget",
    budgetUpdated: "Budget Updated",
    newMonthlyBudget: "Your new monthly budget is",
    newSavingsGoal: "New Savings Goal",
    goalName: "Goal Name",
    goalNamePlaceholder: "e.g., New Tractor",
    targetAmount: "Target Amount",
    targetAmountPlaceholder: "e.g., 500000",
    goalAdded: "Goal Added",
    nowSavingFor: "You're now saving for",
    aiAdvisor: "AI Financial Advisor",
    getAdvice: "Get personalized advice based on your financial data.",
    generateAdvice: "Generate Advice",
    generating: "Generating...",
    yourAdvice: "Your Personalized Advice",
    adviceDescription: "Here are some recommendations based on your financial data.",
    close: "Close",
    error: "Error",
    errorAdvice: "Could not generate financial advice. Please try again later.",
    recentTransactions: "Recent Transactions",
    last5: "Your last 5 transactions.",
    noTransactions: "No transactions yet.",
    addNewCategoryTitle: "Add New Category",
    categoryName: "Category Name",
    categoryNamePlaceholder: "e.g., Dairy Sales",
    type: "Type",
    addCategory: "Add Category",
    categoryAdded: "Category Added",
    newCategoryCreated: "New {type} category '{name}' created.",
    spendingBreakdown: "Spending Breakdown",
    expensesByCategory: "Your expenses by category.",
    noExpenseData: "No expense data to display.",
    transactionDetails: "{amount} {type} for {category}.",
  },
  hi: {
    totalBalance: "कुल शेष",
    totalIncome: "कुल आय",
    totalExpenses: "कुल खर्च",
    addTransaction: "लेन-देन जोड़ें",
    addGoal: "लक्ष्य जोड़ें",
    newTransaction: "नया लेन-देन",
    expense: "खर्च",
    income: "आय",
    amount: "रकम",
    category: "श्रेणी",
    selectCategory: "एक श्रेणी चुनें",
    addNewCategory: "नई श्रेणी जोड़ें",
    description: "विवरण",
    descriptionPlaceholder: "उदा., उपज की बिक्री",
    date: "तारीख",
    pickDate: "एक तारीख चुनें",
    transactionAdded: "लेन-देन जोड़ा गया",
    budget: "बजट",
    monthlySpendingLimit: "आपकी मासिक खर्च सीमा।",
    remaining: "शेष",
    overBudget: "बजट से अधिक",
    editBudget: "बजट संपादित करें",
    setYourBudget: "अपना बजट निर्धारित करें",
    monthlyBudget: "मासिक बजट",
    budgetPlaceholder: "उदा., 20000",
    setBudget: "बजट निर्धारित करें",
    budgetUpdated: "बजट अपडेट किया गया",
    newMonthlyBudget: "आपका नया मासिक बजट है",
    newSavingsGoal: "नया बचत लक्ष्य",
    goalName: "लक्ष्य का नाम",
    goalNamePlaceholder: "उदा., नया ट्रैक्टर",
    targetAmount: "लक्ष्य राशि",
    targetAmountPlaceholder: "उदा., 500000",
    goalAdded: "लक्ष्य जोड़ा गया",
    nowSavingFor: "अब आप इसके लिए बचत कर रहे हैं",
    aiAdvisor: "एआई वित्तीय सलाहकार",
    getAdvice: "अपने वित्तीय डेटा के आधार पर व्यक्तिगत सलाह प्राप्त करें।",
    generateAdvice: "सलाह उत्पन्न करें",
    generating: "उत्पन्न हो रहा है...",
    yourAdvice: "आपकी व्यक्तिगत सलाह",
    adviceDescription: "आपके वित्तीय डेटा के आधार पर यहां कुछ सिफारिशें दी गई हैं।",
    close: "बंद करें",
    error: "त्रुटि",
    errorAdvice: "वित्तीय सलाह उत्पन्न नहीं की जा सकी। कृपया बाद में पुनः प्रयास करें।",
    recentTransactions: "हाल के लेन-देन",
    last5: "आपके अंतिम 5 लेन-देन।",
    noTransactions: "अभी तक कोई लेन-देन नहीं।",
    addNewCategoryTitle: "नई श्रेणी जोड़ें",
    categoryName: "श्रेणी का नाम",
    categoryNamePlaceholder: "उदा., डेयरी बिक्री",
    type: "प्रकार",
    addCategory: "श्रेणी जोड़ें",
    categoryAdded: "श्रेणी जोड़ी गई",
    newCategoryCreated: "नई {type} श्रेणी '{name}' बनाई गई।",
    spendingBreakdown: "खर्च का विवरण",
    expensesByCategory: "श्रेणी के अनुसार आपके खर्च।",
    noExpenseData: "प्रदर्शित करने के लिए कोई खर्च डेटा नहीं।",
    transactionDetails: "{category} के लिए {amount} {type}।",
  },
};


export function Dashboard({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budget, setBudget] = useState<number>(35000);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nextId, setNextId] = useState(0);

  const t = translations[language];

  useEffect(() => {
    const data = initialData[language];
    setTransactions(data.transactions);
    setGoals(data.goals);
    setCategories(data.categories);
    setNextId(data.transactions.length + data.goals.length + 1);
    setIsMounted(true);
  }, [language]);

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
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: `tx-${nextId}` }]);
    setNextId(prev => prev + 1);
  };

  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    setGoals(prev => [...prev, { ...goal, id: `goal-${nextId}` }]);
    setNextId(prev => prev + 1);
  };
  
  const handleAddCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 grid gap-8 content-start">
           <FinancialOverviewCard
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              categories={categories}
              onAddTransaction={handleAddTransaction}
              onAddCategory={handleAddCategory}
              onAddGoal={handleAddGoal}
              language={language}
            />
        </div>
        <div className="lg:col-span-2 grid gap-8 content-start">
          <FinancialPlanner 
            categories={categories}
            onCategoriesChange={setCategories}
            goals={goals}
            onGoalsChange={setGoals}
            language={language}
          />
          <SpendingChartCard transactions={transactions} language={language} />
        </div>
        <div className="lg:col-span-1 grid grid-cols-1 gap-8 content-start">
          <BudgetCard budget={budget} totalExpenses={totalExpenses} onSetBudget={setBudget} language={language}/>
          <RecentTransactionsCard transactions={transactions} language={language} />
          <FinancialAdviceCard
            transactions={transactions}
            goals={goals}
            budget={budget}
            totalIncome={totalIncome}
            language={language}
          />
        </div>
      </div>
      <LearnSection language={language} />
    </div>
  );
}

function FinancialOverviewCard({ totalIncome, totalExpenses, balance, categories, onAddTransaction, onAddCategory, onAddGoal, language = 'en' }: { totalIncome: number; totalExpenses: number; balance: number; categories: Category[]; onAddTransaction: (t: Omit<Transaction, 'id'>) => void; onAddCategory: (c: Category) => void; onAddGoal: (g: Omit<SavingsGoal, 'id'>) => void; language?: 'en' | 'hi';}) {
  const t = translations[language];
  return (
     <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1">
              <CardDescription>{t.totalBalance}</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary">{formatCurrency(balance)}</CardTitle>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                    <ArrowUpCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t.totalIncome}</p>
                        <p className="text-lg font-semibold">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                    <ArrowDownCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-muted-foreground">{t.totalExpenses}</p>
                        <p className="text-lg font-semibold">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
            </div>
            
            <div className="md:col-span-1 flex flex-col gap-2 justify-center">
              <AddTransactionDialog categories={categories} onAddTransaction={onAddTransaction} onAddCategory={onAddCategory} language={language}>
                <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t.addTransaction}
                </Button>
              </AddTransactionDialog>
              <AddGoalDialog onAddGoal={onAddGoal} language={language}>
                <Button variant="outline" className="w-full bg-secondary">
                    <Target className="mr-2 h-4 w-4" /> {t.addGoal}
                </Button>
              </AddGoalDialog>
            </div>
      </CardContent>
    </Card>
  );
}


function AddTransactionDialog({ categories, onAddTransaction, onAddCategory, children, language = 'en' }: { categories: Category[], onAddTransaction: (t: Omit<Transaction, 'id'>) => void, onAddCategory: (c: Category) => void, children: React.ReactNode, language?: 'en' | 'hi' }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      description: "",
      category: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        type: "expense",
        amount: 0,
        date: new Date(),
        description: "",
        category: "",
      });
    }
  }, [form, open]);


  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    onAddTransaction(values);
    toast({
      title: t.transactionAdded,
      description: t.transactionDetails.replace('{amount}', formatCurrency(values.amount)).replace('{type}', values.type === 'income' ? t.income : t.expense).replace('{category}', values.category),
    });
    form.reset();
    setOpen(false);
  };
  
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.newTransaction}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense">{t.expense}</TabsTrigger>
                      <TabsTrigger value="income">{t.income}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.amount}</FormLabel>
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
                    <FormLabel>{t.category}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectCategory} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.filter(c => c.type === form.watch('type')).map(cat => (
                          <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                         <AddCategoryDialog onAddCategory={onAddCategory} type={form.watch('type')} language={language} >
                            <div className="flex w-full items-center p-2 text-sm text-primary cursor-pointer hover:bg-muted rounded-sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> {t.addNewCategory}
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
                    <FormLabel>{t.description}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.descriptionPlaceholder} {...field} />
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
                    <FormLabel>{t.date}</FormLabel>
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
                            {field.value ? format(field.value, "PPP") : <span>{t.pickDate}</span>}
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
                <Button type="submit">{t.addTransaction}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}

function SpendingChartCard({ transactions, language = 'en' }: { transactions: Transaction[], language?: 'en' | 'hi' }) {
  const t = translations[language];
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.spendingBreakdown}</CardTitle>
        <CardDescription>{t.expensesByCategory}</CardDescription>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
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
              <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="hsl(var(--primary))" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index % 5 + 1}))`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            {t.noExpenseData}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetCard({ budget, totalExpenses, onSetBudget, language = 'en' }: { budget: number, totalExpenses: number, onSetBudget: (b: number) => void, language?: 'en' | 'hi' }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { amount: budget },
  });

  useEffect(() => {
    form.setValue('amount', budget);
  }, [budget, form]);

  const onSubmit = (values: z.infer<typeof budgetSchema>) => {
    onSetBudget(values.amount);
    toast({ title: t.budgetUpdated, description: `${t.newMonthlyBudget} ${formatCurrency(values.amount)}.` });
    setOpen(false);
  };

  const percentageSpent = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const remainingBudget = budget - totalExpenses;
  
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>{t.budget}</CardTitle>
        <CardDescription className="text-xs">{t.monthlySpendingLimit}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold">{formatCurrency(totalExpenses)}</span>
          <span className="text-sm text-muted-foreground">/ {formatCurrency(budget)}</span>
        </div>
        <Progress value={percentageSpent} />
        <div className="text-xs text-muted-foreground">
          {remainingBudget >= 0 ? `${formatCurrency(remainingBudget)} ${t.remaining}` : `${formatCurrency(Math.abs(remainingBudget))} ${t.overBudget}`}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="mr-2 h-4 w-4" /> {t.editBudget}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t.setYourBudget}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.monthlyBudget}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t.budgetPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{t.setBudget}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
      </CardFooter>
    </Card>
  );
}

function AddGoalDialog({ onAddGoal, children, language = 'en' }: { onAddGoal: (g: Omit<SavingsGoal, 'id'>) => void, children: React.ReactNode, language?: 'en' | 'hi' }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  const form = useForm<z.infer<typeof savingsGoalSchema>>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: { name: "", targetAmount: 0 },
  });

  const onSubmit = (values: z.infer<typeof savingsGoalSchema>) => {
    onAddGoal(values);
    toast({ title: t.goalAdded, description: `${t.nowSavingFor} ${values.name}!` });
    form.reset();
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{t.newSavingsGoal}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.goalName}</FormLabel>
                <FormControl><Input placeholder={t.goalNamePlaceholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.targetAmount}</FormLabel>
                <FormControl><Input type="number" placeholder={t.targetAmountPlaceholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit">{t.addGoal}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


function FinancialAdviceCard({ transactions, goals, budget, totalIncome, language = 'en' }: { transactions: Transaction[], goals: SavingsGoal[], budget: number, totalIncome: number, language?: 'en' | 'hi' }) {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdviceDialog, setShowAdviceDialog] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

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
      setShowAdviceDialog(true);
    } catch (error) {
      console.error("Failed to generate advice:", error);
      toast({
        variant: "destructive",
        title: t.error,
        description: t.errorAdvice,
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> {t.aiAdvisor}</CardTitle>
        <CardDescription>{t.getAdvice}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleGenerateAdvice} disabled={isLoading} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t.generating}</> : t.generateAdvice}
        </Button>
      </CardFooter>
      <Dialog open={showAdviceDialog} onOpenChange={setShowAdviceDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{t.yourAdvice}</DialogTitle>
            <DialogDescription>
              {t.adviceDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-h-[60vh] overflow-y-auto p-4 border rounded-lg">
            <p className="whitespace-pre-wrap">{advice}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAdviceDialog(false)}>{t.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RecentTransactionsCard({ transactions, language = 'en' }: { transactions: Transaction[], language?: 'en' | 'hi' }) {
  const t = translations[language];
  const recentTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <Card>
       <CardHeader>
        <CardTitle>{t.recentTransactions}</CardTitle>
        <CardDescription>{t.last5}</CardDescription>
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
            {t.noTransactions}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddCategoryDialog({ onAddCategory, type, children, language = 'en' }: { onAddCategory: (c: Category) => void; type: 'income' | 'expense', children: React.ReactNode, language?: 'en' | 'hi' }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const t = translations[language];

    const form = useForm<z.infer<typeof categorySchema>>({
      resolver: zodResolver(categorySchema),
      defaultValues: { name: "", type },
    });
  
    useEffect(() => {
      form.setValue('type', type);
    }, [type, form]);
  
    const onSubmit = (values: z.infer<typeof categorySchema>) => {
      onAddCategory(values);
      toast({ title: t.categoryAdded, description: t.newCategoryCreated.replace('{type}', values.type === 'income' ? t.income : t.expense).replace('{name}', values.name) });
      form.reset();
      setOpen(false);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNewCategoryTitle}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.categoryName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.categoryNamePlaceholder} {...field} />
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
                    <FormLabel>{t.type}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">{t.income}</SelectItem>
                        <SelectItem value="expense">{t.expense}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{t.addCategory}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

    

    

    

