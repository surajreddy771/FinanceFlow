
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Video, Edit } from "lucide-react";
import type { Category, SavingsGoal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

// Schemas
const goalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().positive("Target must be positive"),
});

const fundsSchema = z.object({
    investmentCategory: z.enum(['equity', 'debt', 'hybrid', 'commodities']),
    timeHorizon: z.enum(["short-term", "medium-term", "long-term"]),
    riskAppetite: z.enum(["low", "medium", "high"]),
});

const newCategorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  type: z.enum(['income', 'expense']),
});


export function FinancialPlanner({ categories, onCategoriesChange, goals, onGoalsChange, language = 'en' }: { categories: Category[], onCategoriesChange: (cats: Category[]) => void, goals: SavingsGoal[], onGoalsChange: (goals: SavingsGoal[]) => void, language?: 'en' | 'hi' }) {

  const t = translations[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.planner.title}</CardTitle>
        <CardDescription>
          {t.planner.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="goal-planner" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goal-planner">{t.tabs.goalPlanner}</TabsTrigger>
            <TabsTrigger value="investments">
              {t.tabs.investments}
            </TabsTrigger>
            <TabsTrigger value="categories">
              {t.tabs.categories}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="goal-planner">
            <GoalPlanner goals={goals} onGoalsChange={onGoalsChange} />
          </TabsContent>
          <TabsContent value="investments">
            <FundsRecommendation />
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManager categories={categories} onCategoriesChange={onCategoriesChange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const translations = {
  en: {
    planner: {
      title: 'Financial Goal Planner',
      description: 'Plan your financial goals, get investment recommendations, and manage your budget categories.'
    },
    tabs: {
      goalPlanner: 'Goal Planner',
      investments: 'Investments',
      categories: 'Expenditure Categories',
    }
  },
  hi: {
    planner: {
      title: 'वित्तीय लक्ष्य योजनाकार',
      description: 'अपने वित्तीय लक्ष्यों की योजना बनाएं, निवेश सिफारिशें प्राप्त करें और अपनी बजट श्रेणियां प्रबंधित करें।'
    },
    tabs: {
      goalPlanner: 'लक्ष्य योजनाकार',
      investments: 'निवेश',
      categories: 'खर्च श्रेणियाँ',
    }
  }
};

function GoalPlanner({ goals, onGoalsChange }: { goals: SavingsGoal[], onGoalsChange: (goals: SavingsGoal[]) => void }) {
  
  const handleAddGoal = () => {
    const newId = crypto.randomUUID();
    onGoalsChange([...goals, { id: newId, name: "New Goal", targetAmount: 1000 }]);
  };

  const handleUpdateGoal = (id: string, updatedGoal: Partial<Omit<SavingsGoal, 'id'>>) => {
    onGoalsChange(goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
  };

  const handleDeleteGoal = (id: string) => {
    onGoalsChange(goals.filter(g => g.id !== id));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        {goals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddGoal}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
      </Button>
    </div>
  );
}

function GoalItem({ goal, onUpdate, onDelete }: { goal: SavingsGoal, onUpdate: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => void, onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount);
  
  const savedAmount = 0; // This would come from transactions in a real app
  const progress = (savedAmount / goal.targetAmount) * 100;

  const handleSave = () => {
    onUpdate(goal.id, { name, targetAmount });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {isEditing ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`name-${goal.id}`}>Goal Name</Label>
              <Input id={`name-${goal.id}`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="w-32">
              <Label htmlFor={`target-${goal.id}`}>Target</Label>
              <Input id={`target-${goal.id}`} type="number" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
            </div>
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold">{goal.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(savedAmount)} / <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(goal.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
}


function FundsRecommendation() {
    const [result, setResult] = useState<string | null>(null);
    const form = useForm<z.infer<typeof fundsSchema>>({
        resolver: zodResolver(fundsSchema),
        defaultValues: {
            investmentCategory: 'hybrid',
            timeHorizon: 'medium-term',
            riskAppetite: 'medium',
        }
    });

    function onSubmit(values: z.infer<typeof fundsSchema>) {
        let recommendation = `Based on your selections, here are some mock investment recommendations for the ${values.investmentCategory} category:\n\n`;

        if (values.investmentCategory === 'equity') {
            if (values.riskAppetite === 'low') {
                recommendation += "Low Risk Equity:\n- Large-Cap Index Funds (Nifty 50, Sensex): Invests in the largest, most stable companies. Diversified and relatively lower risk for equity.\n- Dividend Yield Funds: Focus on companies that pay regular dividends, providing a cushion.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "Medium Risk Equity:\n- Flexi-Cap/Multi-Cap Funds: Diversified across companies of different sizes. Good for capturing broad market growth.\n- ELSS (Tax Saver) Funds: Offer tax benefits under Section 80C with a 3-year lock-in, suitable for medium-risk investors.";
            } else { // high
                recommendation += "High Risk Equity:\n- Mid-Cap and Small-Cap Funds: Invest in smaller, high-growth potential companies. Higher risk but can offer significant returns.\n- Sectoral/Thematic Funds: Focus on a specific sector like technology or healthcare. Very high risk due to lack of diversification.";
            }
        } else if (values.investmentCategory === 'debt') {
             if (values.riskAppetite === 'low') {
                recommendation += "Low Risk Debt:\n- Liquid Funds / Ultra Short Duration Funds: For very short-term goals (a few days to months). Highly stable.\n- Bank Fixed Deposits (FDs) / Post Office Deposits: Safest options with guaranteed returns.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "Medium Risk Debt:\n- Corporate Bond Funds: Invest in bonds issued by companies. Carry slightly more risk than government bonds for better returns.\n- Short to Medium Duration Funds: Invest in bonds with maturities of 1-5 years.";
            } else { // high
                recommendation += "High Risk Debt:\n- Credit Risk Funds: Invest in lower-rated corporate bonds for higher yields. Risk of default is higher.\n- Long Duration Funds: Sensitive to interest rate changes, can be volatile but offer higher returns if rates fall.";
            }
        } else if (values.investmentCategory === 'hybrid') {
            if (values.riskAppetite === 'low') {
                recommendation += "Low Risk Hybrid:\n- Conservative Hybrid Funds: Invests 75-90% in debt and the rest in equity. Provides stability with a small growth component.\n- Equity Savings Funds: Use a mix of equity, debt, and arbitrage for stable, tax-efficient returns.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "Medium Risk Hybrid:\n- Balanced Hybrid / Aggressive Hybrid Funds: A classic mix of 65-80% in equity and the rest in debt. Good for long-term wealth creation with managed risk.\n- Dynamic Asset Allocation Funds: Actively manage equity/debt allocation based on market conditions.";
            } else { // high
                recommendation += "High Risk Hybrid:\n- Multi-Asset Allocation Funds: Invest in at least three asset classes (e.g., equity, debt, gold, real estate), offering diversification but can be complex.\n- Aggressive Hybrid Funds with higher equity allocation (up to 80%).";
            }
        } else { // commodities
             recommendation += "Commodities (Generally High Risk):\n- Gold ETFs / Gold Savings Funds: Invest in gold electronically without holding it physically. Acts as a hedge against inflation.\n- Silver ETFs: Similar to Gold ETFs but for silver, which can be more volatile.\n- Global Commodity Funds: Mutual funds that invest in a basket of commodities. High risk and complex.";
        }
        
        recommendation += "\n\nDisclaimer: This is not real financial advice. Please consult with a certified financial advisor before making any investment decisions."
        setResult(recommendation);
    }
    
    return (
        <div className="p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="investmentCategory"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Investment Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="equity">Equity (Stocks)</SelectItem>
                                    <SelectItem value="debt">Debt (Bonds, FDs)</SelectItem>
                                    <SelectItem value="hybrid">Hybrid (Mix of Equity & Debt)</SelectItem>
                                    <SelectItem value="commodities">Commodities (Gold, Silver)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="timeHorizon"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Time Horizon</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="short-term">Short-Term (1-3 years)</SelectItem>
                                    <SelectItem value="medium-term">Medium-Term (3-5 years)</SelectItem>
                                    <SelectItem value="long-term">Long-Term (5+ years)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="riskAppetite"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Risk Appetite</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <Button type="submit">Get Recommendation</Button>
                </form>
            </Form>
            {result && (
                <Alert className="mt-6">
                    <AlertTitle>Investment Recommendations</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{result}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}

function FinancialExperts() {

    const experts = [
        { id: 1, name: "Anita Desai", specialty: "Agricultural Loans & KCC", rate: 150 },
        { id: 2, name: "Rajesh Kumar", specialty: "Crop Insurance & Risk", rate: 200 },
        { id: 3, name: "Sita Sharma", specialty: "Rural Investment Schemes", rate: 120 },
    ]

    const handleSchedule = (expertName: string) => {
        // This would typically open a calendar or scheduling modal
        // and integrate with an API like Zoom or Google Meet.
        alert(`Scheduling a meeting with ${expertName}. A (mock) confirmation will be sent to your email with a video conference link.`);
    }

    return (
        <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Connect with a Financial Expert</h3>
            <p className="text-muted-foreground mb-6">
                Schedule a one-on-one video conference with a certified financial planner to get personalized advice for your agricultural needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(expert => (
                    <Card key={expert.id}>
                        <CardHeader>
                            <CardTitle>{expert.name}</CardTitle>
                            <CardDescription>{expert.specialty}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{formatCurrency(expert.rate)} / hour</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleSchedule(expert.name)}>
                                <Video className="mr-2 h-4 w-4" /> Schedule a Call
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function CategoryManager({ categories, onCategoriesChange }: { categories: Category[], onCategoriesChange: (cats: Category[]) => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof newCategorySchema>>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      name: '',
      type: 'expense'
    }
  });

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  function onSubmit(values: z.infer<typeof newCategorySchema>) {
    onCategoriesChange([...categories, values]);
    toast({ title: 'Category Added', description: `New ${values.type} category "${values.name}" created.` });
    form.reset();
  }
  
  function handleDelete(categoryName: string) {
    onCategoriesChange(categories.filter(c => c.name !== categoryName));
  }

  return (
    <div className="p-4 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 p-4 border rounded-lg">
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>New Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Crop Sales" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit"><PlusCircle className="mr-2 h-4 w-4"/>Add Category</Button>
        </form>
      </Form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Income</h3>
          <ul className="space-y-2">
            {incomeCategories.map(cat => (
              <li key={cat.name} className="flex items-center justify-between p-2 border rounded-md">
                <span>{cat.name}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.name)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Expense</h3>
           <ul className="space-y-2">
            {expenseCategories.map(cat => (
              <li key={cat.name} className="flex items-center justify-between p-2 border rounded-md">
                <span>{cat.name}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.name)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
