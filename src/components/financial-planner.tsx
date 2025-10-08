
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
import { PlusCircle, Trash2, Video, BookOpen, Newspaper, LifeBuoy, Users, Tractor, Briefcase } from "lucide-react";
import { Separator } from "./ui/separator";
import type { Category } from "@/lib/types";
import Image from "next/image";
import { Badge } from "./ui/badge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

// Schemas
const singleGoalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required."),
  goalCost: z.coerce.number().positive(),
  currentSavings: z.coerce.number().min(0),
  monthlySalary: z.coerce.number().positive(),
  monthlyExpenses: z.coerce.number().min(0),
  tenure: z.coerce.number().positive("Tenure must be positive (in months)."),
});

const multiGoalItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Goal name is required"),
  cost: z.coerce.number().positive(),
  priority: z.coerce.number().min(1).max(5),
});

const multiGoalSchema = z.object({
  goals: z.array(multiGoalItemSchema),
  planningMode: z.enum(["sequential", "simultaneous"]),
  monthlySavings: z.coerce.number().positive(),
});

const fundsSchema = z.object({
    location: z.enum(['urban', 'rural']),
    timeHorizon: z.enum(["short-term", "medium-term", "long-term"]),
    riskAppetite: z.enum(["low", "medium", "high"]),
});

const newCategorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  type: z.enum(['income', 'expense']),
});


export function FinancialPlanner({ categories, onCategoriesChange, language = 'en' }: { categories: Category[], onCategoriesChange: (cats: Category[]) => void, language?: 'en' | 'hi' }) {

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
        <Tabs defaultValue="single-goal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="single-goal">{t.tabs.singleGoal}</TabsTrigger>
            <TabsTrigger value="multi-goal">{t.tabs.multiGoal}</TabsTrigger>
            <TabsTrigger value="funds">
              {t.tabs.investments}
              <Badge variant="outline" className="ml-2 bg-accent text-accent-foreground">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="categories">
              {t.tabs.categories}
              <Badge variant="outline" className="ml-2 bg-accent text-accent-foreground">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="learn">
              {t.tabs.learn}
              <Badge variant="outline" className="ml-2 bg-accent text-accent-foreground">New</Badge>
            </TabsTrigger>
            {/* <TabsTrigger value="experts">{t.tabs.experts}</TabsTrigger> */}
          </TabsList>
          <TabsContent value="single-goal">
            <SingleGoalPlanner />
          </TabsContent>
          <TabsContent value="multi-goal">
            <MultiGoalPlanner />
          </TabsContent>
          <TabsContent value="funds">
            <FundsRecommendation />
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManager categories={categories} onCategoriesChange={onCategoriesChange} />
          </TabsContent>
          <TabsContent value="learn">
            <LearnTab language={language}/>
          </TabsContent>
          {/* <TabsContent value="experts">
            <FinancialExperts />
          </TabsContent> */}
        </Tabs>
      </CardContent>
    </Card>
  );
}

const translations = {
  en: {
    planner: {
      title: 'Financial Goal Planner',
      description: 'Plan your financial goals, get investment recommendations, and browse educational content.'
    },
    tabs: {
      singleGoal: 'Single Goal',
      multiGoal: 'Multi-Goal',
      investments: 'Investments',
      categories: 'Categories',
      learn: 'Learn',
      experts: 'Financial Experts',
    }
  },
  hi: {
    planner: {
      title: 'वित्तीय लक्ष्य योजनाकार',
      description: 'अपने वित्तीय लक्ष्यों की योजना बनाएं, निवेश सिफारिशें प्राप्त करें, और शैक्षिक सामग्री ब्राउज़ करें।'
    },
    tabs: {
      singleGoal: 'एकल लक्ष्य',
      multiGoal: 'बहु-लक्ष्य',
      investments: 'निवेश',
      categories: 'श्रेणियाँ',
      learn: 'जानें',
      experts: 'वित्तीय विशेषज्ञ',
    }
  }
};


function SingleGoalPlanner() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<z.infer<typeof singleGoalSchema>>({
    resolver: zodResolver(singleGoalSchema),
    defaultValues: {
      goalName: "New Tractor",
      goalCost: 10000,
      currentSavings: 1000,
      monthlySalary: 5000,
      monthlyExpenses: 3000,
      tenure: 12,
    },
  });

  function onSubmit(values: z.infer<typeof singleGoalSchema>) {
    const monthlySavingsAvailable = values.monthlySalary - values.monthlyExpenses;
    const remainingGoal = values.goalCost - values.currentSavings;
    if (remainingGoal <= 0) {
      setResult("Congratulations! You have already achieved this goal.");
      return;
    }
    const requiredMonthlySavings = remainingGoal / values.tenure;

    if (monthlySavingsAvailable >= requiredMonthlySavings) {
      setResult(
        `Yes, this goal is achievable! You need to save ${formatCurrency(
          requiredMonthlySavings
        )} per month. Your available monthly savings are ${formatCurrency(
          monthlySavingsAvailable
        )}.`
      );
    } else {
      const suggestedTenure = Math.ceil(remainingGoal / monthlySavingsAvailable);
      const suggestedSavings = remainingGoal / values.tenure;
      setResult(
        `This goal is not achievable with your current savings plan. You need to save ${formatCurrency(
          requiredMonthlySavings
        )} per month, but you only have ${formatCurrency(
          monthlySavingsAvailable
        )} available.
        
Suggestions:
- Increase your tenure to ${suggestedTenure} months.
- Increase your monthly savings to ${formatCurrency(suggestedSavings)}.`
      );
    }
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="goalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Buy a new tractor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Cost (Target Amount)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentSavings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Savings for this Goal</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlySalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Expenses</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenure (in months)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Alert className="mt-6">
          <AlertTitle>Calculation Result</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">
            {result}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function MultiGoalPlanner() {
    const [result, setResult] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const form = useForm<z.infer<typeof multiGoalSchema>>({
      resolver: zodResolver(multiGoalSchema),
      defaultValues: {
        goals: [{ id: '1', name: "New Tractor", cost: 20000, priority: 1}],
        planningMode: "simultaneous",
        monthlySavings: 1000,
      },
    });
  
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "goals",
    });
  
    function onSubmit(values: z.infer<typeof multiGoalSchema>) {
        let plan = '';
        if (values.planningMode === 'sequential') {
            plan = 'Sequential Plan:\n';
            let remainingSavings = values.monthlySavings;
            let months = 0;
            const sortedGoals = [...values.goals].sort((a,b) => a.priority - b.priority);
            sortedGoals.forEach(goal => {
                const monthsToAchieve = goal.cost / remainingSavings;
                months += monthsToAchieve;
                plan += `- Goal "${goal.name}" (${formatCurrency(goal.cost)}): Achieved in ${monthsToAchieve.toFixed(1)} months. Total time: ${months.toFixed(1)} months.\n`;
            });
            plan += `\nTotal time to achieve all goals sequentially is ${months.toFixed(1)} months.`;

        } else { // Simultaneous
            plan = 'Simultaneous Plan:\n';
            const totalPriority = values.goals.reduce((sum, g) => sum + g.priority, 0);
            values.goals.forEach(goal => {
                const allocatedSavings = (goal.priority / totalPriority) * values.monthlySavings;
                const monthsToAchieve = goal.cost / allocatedSavings;
                plan += `- Goal "${goal.name}" (${formatCurrency(goal.cost)}): Allocate ${formatCurrency(allocatedSavings)}/month. Achieved in ${monthsToAchieve.toFixed(1)} months.\n`;
            });
            const maxTime = Math.max(...values.goals.map(goal => {
                const allocatedSavings = (goal.priority / values.goals.reduce((s, g) => s + g.priority, 0)) * values.monthlySavings;
                return goal.cost / allocatedSavings;
            }));
            plan += `\nAll goals will be achieved in approximately ${maxTime.toFixed(1)} months.`
        }

        setResult(plan);
    }

    const handleAddGoal = () => {
        // Using a more reliable way to generate unique IDs on the client
        append({ id: `goal-${Date.now()}-${Math.random()}`, name: "", cost: 1000, priority: 3 });
    };
  
    return (
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Your Goals</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`goals.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Name</FormLabel>
                        <FormControl><Input placeholder="e.g. New barn" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`goals.${index}.cost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`goals.${index}.priority`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1-5)</FormLabel>
                        <FormControl><Input type="number" min="1" max="5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {isClient && <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGoal}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Button>}
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="monthlySavings"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Monthly Savings</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="planningMode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Planning Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="simultaneous">Simultaneous</SelectItem>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Button type="submit">Generate Plan</Button>
          </form>
        </Form>
        {result && (
          <Alert className="mt-6">
            <AlertTitle>Your Multi-Goal Plan</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">{result}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

function FundsRecommendation() {
    const [result, setResult] = useState<string | null>(null);
    const form = useForm<z.infer<typeof fundsSchema>>({
        resolver: zodResolver(fundsSchema),
        defaultValues: {
            location: 'rural',
            timeHorizon: 'medium-term',
            riskAppetite: 'medium',
        }
    });

    function onSubmit(values: z.infer<typeof fundsSchema>) {
        let recommendation = `Based on your selections for a user in a ${values.location} area, here are some mock investment and loan recommendations:\n\n`;

        if (values.location === 'rural') {
            if (values.timeHorizon === 'short-term') {
                recommendation += "### For Savings (1-3 Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **Cooperative Bank Fixed Deposits (FDs):** Very safe, predictable returns, supports local community.\n- **Post Office Time Deposit:** Government-backed security.";
                } else if (values.riskAppetite === 'medium') {
                    recommendation += "- **Kisan Vikas Patra (KVP):** A government savings scheme that doubles the investment over a certain period.\n- **Balanced Mutual Funds:** A mix of equity and debt for moderate growth.";
                } else { // high
                    recommendation += "- **High-yield Savings Account in a Rural Bank:** Safe and offers better returns than traditional savings.\n- **Equity Linked Savings Scheme (ELSS):** Higher risk with tax benefits, suitable for those with some risk capacity.";
                }
            } else if (values.timeHorizon === 'medium-term') {
                recommendation += "### For Investments (3-5 Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **National Savings Certificates (NSC):** Government-backed, fixed return, tax benefits.\n- **Debt Mutual Funds:** Investing in government and corporate bonds.";
                } else if (values.riskAppetite === 'medium') {
                    recommendation += "- **Large-Cap Equity Funds:** Investing in top, stable companies. Lower risk within equities.\n- **Hybrid Funds:** A balanced mix of stocks and bonds.";
                } else { // high
                    recommendation += "- **Flexi-Cap/Multi-Cap Equity Funds:** Diversified across different-sized companies, higher risk-return potential.\n- **Real Estate Investment in Farmland:** Can provide rental income and capital appreciation.";
                }
            } else { // long-term
                recommendation += "### For Long-Term Growth (5+ Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **Public Provident Fund (PPF):** Long-term, government-backed, tax-free returns.\n- **Sukanya Samriddhi Yojana:** For a girl child's future education and marriage expenses.";
                } else if (values.riskAppetite === 'medium') {
                    recommendation += "- **Index Funds (e.g., Nifty 50):** Invests in the market index, diversified and relatively safe for long-term equity exposure.\n- **Gold Bonds:** An alternative to physical gold, offering interest income.";
                } else { // high
                    recommendation += "- **Mid-Cap/Small-Cap Equity Funds:** Higher risk with the potential for high returns from growing companies.\n- **Direct Equity:** Investing directly in stocks, requires knowledge and research.";
                }
            }
            
            recommendation += "\n### For Loans:\n"
            recommendation += "- **Kisan Credit Card (KCC):** For short-term credit for farming needs like seeds, fertilizers, and pesticides.\n"
            recommendation += "- **Tractor and Equipment Loans:** Offered by most rural and commercial banks to finance machinery purchase.\n"
            recommendation += "- **Microfinance Loans:** Small loans from Microfinance Institutions (MFIs) for various needs, including small business or livestock.\n"
        } else { // urban
            if (values.timeHorizon === 'short-term') {
                recommendation += "### For Savings (1-3 Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **Bank Fixed Deposits (FDs):** Safe, predictable returns.\n- **Liquid Mutual Funds:** Low risk, higher liquidity than FDs.";
                } else {
                    recommendation += "- **Arbitrage Funds:** Low-risk funds that leverage price differences in different markets.\n- **Short-Term Debt Funds:** Invest in debt instruments with short maturities.";
                }
            } else if (values.timeHorizon === 'medium-term') {
                recommendation += "### For Investments (3-5 Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **Corporate Bond Funds:** Investing in bonds issued by companies.\n- **National Savings Certificates (NSC):** Government-backed, fixed return.";
                } else if (values.riskAppetite === 'medium') {
                    recommendation += "- **Balanced Advantage Funds:** Dynamically allocate between equity and debt.\n- **Large-Cap Equity Funds:** Investing in top, stable blue-chip companies.";
                } else {
                    recommendation += "- **Real Estate Investment Trusts (REITs):** Invest in a portfolio of income-generating real estate.";
                }
            } else { // long-term
                recommendation += "### For Long-Term Growth (5+ Years):\n";
                if (values.riskAppetite === 'low') {
                    recommendation += "- **Public Provident Fund (PPF):** Long-term, tax-free returns, government-backed.\n- **Voluntary Provident Fund (VPF):** Higher contribution than EPF, with same benefits.";
                } else if (values.riskAppetite === 'medium') {
                    recommendation += "- **Index Funds (Nifty 50, Sensex):** Diversified, market-linked returns.\n- **ELSS Mutual Funds:** Tax-saving funds with a 3-year lock-in, equity exposure.";
                } else { // high
                    recommendation += "- **Mid-Cap/Small-Cap Equity Funds:** Higher risk, high growth potential.\n- **Direct Equity/Stocks:** Requires significant research and risk tolerance.";
                }
            }

            recommendation += "\n### For Loans:\n"
            recommendation += "- **Home Loans:** For purchasing property.\n"
            recommendation += "- **Car Loans:** For purchasing a vehicle.\n"
            recommendation += "- **Personal Loans:** Unsecured loans for various personal needs.\n"
        }
        
        recommendation += "\n*Disclaimer: This is not real financial advice. Please consult with a certified financial advisor before making any investment or loan decisions.*"
        setResult(recommendation);
    }
    
    return (
        <div className="p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="rural">Rural</SelectItem>
                                    <SelectItem value="urban">Urban</SelectItem>
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
                    <AlertTitle>Investment & Loan Recommendations</AlertTitle>
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
          <h3 className="text-lg font-medium mb-2">Income Categories</h3>
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
          <h3 className="text-lg font-medium mb-2">Expense Categories</h3>
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

const learnContent = {
  en: {
    title: "Financial Literacy Corner",
    description: "Empower yourself with knowledge. Browse articles and videos to improve your financial health.",
    articles: [
      {
        title: "Understanding Mutual Funds",
        description: "A beginner's guide to how mutual funds work, their types, and how to invest in them.",
        icon: Newspaper,
        image: "https://picsum.photos/seed/mf/600/400",
        aiHint: "finance charts",
        link: "#"
      },
      {
        title: "Basics of Kisan Credit Card (KCC)",
        description: "Learn about the features, benefits, and application process for the Kisan Credit Card scheme.",
        icon: Newspaper,
        image: "https://picsum.photos/seed/kcc/600/400",
        aiHint: "farmland agriculture",
        link: "#"
      },
    ],
    videos: [
        {
        title: "Video: Budgeting 101 for Families",
        description: "A short video explaining how to create and stick to a family budget effectively.",
        icon: Video,
        image: "https://picsum.photos/seed/budget/600/400",
        aiHint: "family smiling",
        link: "#"
      },
      {
        title: "Video: Crop Insurance Explained",
        description: "Understand the importance of crop insurance and how it can protect you from financial losses.",
        icon: Video,
        image: "https://picsum.photos/seed/crop/600/400",
        aiHint: "agriculture crops",
        link: "#"
      }
    ]
  },
  hi: {
    title: "वित्तीय साक्षरता कॉर्नर",
    description: "ज्ञान से खुद को सशक्त बनाएं। अपने वित्तीय स्वास्थ्य को बेहतर बनाने के लिए लेख और वीडियो ब्राउज़ करें।",
    articles: [
      {
        title: "म्यूचुअल फंड को समझना",
        description: "म्यूचुअल फंड कैसे काम करते हैं, उनके प्रकार और उनमें निवेश कैसे करें, इसके लिए एक शुरुआती गाइड।",
        icon: Newspaper,
        image: "https://picsum.photos/seed/mf/600/400",
        aiHint: "finance charts",
        link: "#"
      },
      {
        title: "किसान क्रेडिट कार्ड (KCC) की मूल बातें",
        description: "किसान क्रेडिट कार्ड योजना की विशेषताओं, लाभों और आवेदन प्रक्रिया के बारे में जानें।",
        icon: Newspaper,
        image: "https://picsum.photos/seed/kcc/600/400",
        aiHint: "farmland agriculture",
        link: "#"
      },
    ],
    videos: [
        {
        title: "वीडियो: परिवारों के लिए बजट 101",
        description: "एक छोटा वीडियो जो बताता है कि परिवार का बजट प्रभावी ढंग से कैसे बनाया जाए और उसका पालन कैसे किया जाए।",
        icon: Video,
        image: "https://picsum.photos/seed/budget/600/400",
        aiHint: "family smiling",
        link: "#"
      },
      {
        title: "वीडियो: फसल बीमा समझाया गया",
        description: "फसल बीमा के महत्व को समझें और यह आपको वित्तीय नुकसान से कैसे बचा सकता है।",
        icon: Video,
        image: "https://picsum.photos/seed/crop/600/400",
        aiHint: "agriculture crops",
        link: "#"
      }
    ]
  }
}

function LearnTab({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const content = learnContent[language];

  return (
    <div className="p-4 space-y-8">
      <div>
        <h3 className="text-2xl font-bold flex items-center gap-2"><BookOpen/> {content.title}</h3>
        <p className="text-muted-foreground">{content.description}</p>
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-4">Articles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.articles.map((item) => (
            <Card key={item.title} className="overflow-hidden">
              <Image src={item.image} alt={item.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={item.aiHint}/>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><item.icon className="h-5 w-5"/> {item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="p-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-semibold mb-4">Videos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.videos.map((item) => (
            <Card key={item.title} className="overflow-hidden">
               <Image src={item.image} alt={item.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={item.aiHint}/>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><item.icon className="h-5 w-5"/> {item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter>
                 <Button asChild variant="link" className="p-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">Watch Now &rarr;</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

    

    