"use client";

import { useState } from "react";
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
import { PlusCircle, Trash2, Video } from "lucide-react";
import { Separator } from "./ui/separator";

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
    timeHorizon: z.enum(["short-term", "medium-term", "long-term"]),
    riskAppetite: z.enum(["low", "medium", "high"]),
});


export function FinancialPlanner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Goal Planner</CardTitle>
        <CardDescription>
          Plan your financial goals, get investment recommendations, and connect
          with experts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single-goal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single-goal">Single Goal</TabsTrigger>
            <TabsTrigger value="multi-goal">Multi-Goal</TabsTrigger>
            <TabsTrigger value="funds">Funds Recommendation</TabsTrigger>
            <TabsTrigger value="experts">Financial Experts</TabsTrigger>
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
          <TabsContent value="experts">
            <FinancialExperts />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SingleGoalPlanner() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<z.infer<typeof singleGoalSchema>>({
    resolver: zodResolver(singleGoalSchema),
    defaultValues: {
      goalName: "",
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
                    <Input placeholder="e.g., Buy a new car" {...field} />
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
                  <FormLabel>Monthly Salary</FormLabel>
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
    const form = useForm<z.infer<typeof multiGoalSchema>>({
      resolver: zodResolver(multiGoalSchema),
      defaultValues: {
        goals: [{ id: '1', name: "New Car", cost: 20000, priority: 1}],
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
                        <FormControl><Input {...field} /></FormControl>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: crypto.randomUUID(), name: "", cost: 1000, priority: 3 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Button>
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
            timeHorizon: 'medium-term',
            riskAppetite: 'medium',
        }
    });

    function onSubmit(values: z.infer<typeof fundsSchema>) {
        let recommendation = "Based on your selections, here are some mock investment recommendations:\n\n";

        if (values.timeHorizon === 'short-term') {
            if (values.riskAppetite === 'low') {
                recommendation += "- **Fixed Deposits (FDs):** Very safe, predictable returns.\n- **Liquid Mutual Funds:** Low risk, higher liquidity than FDs.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "- **Short-Term Debt Funds:** Slightly higher returns than liquid funds, with slightly more risk.\n- **Arbitrage Funds:** Low risk, potential for returns similar to liquid funds, tax-efficient.";
            } else { // high
                recommendation += "- **Aggressive Hybrid Funds:** A mix of equity and debt, for those willing to take some risk for higher returns.\n- **High-yield Savings Account:** Not an investment, but safe and offers better returns than traditional savings.";
            }
        } else if (values.timeHorizon === 'medium-term') {
            if (values.riskAppetite === 'low') {
                recommendation += "- **Corporate Bond Funds:** Investing in company bonds, relatively safe.\n- **National Savings Certificates (NSC):** Government-backed, fixed return, tax benefits.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "- **Balanced Advantage Funds:** Dynamic allocation between equity and debt.\n- **Large-Cap Equity Funds:** Investing in top, stable companies. Lower risk within equities.";
            } else { // high
                recommendation += "- **Flexi-Cap/Multi-Cap Equity Funds:** Diversified across market caps, higher risk-return potential.\n- **Thematic Funds (e.g., Tech or Healthcare):** High risk, concentrated in a specific sector.";
            }
        } else { // long-term
            if (values.riskAppetite === 'low') {
                recommendation += "- **Public Provident Fund (PPF):** Long-term, government-backed, tax-free returns.\n- **Index Funds (e.g., Nifty 50):** Invests in the market index, diversified and relatively safe for long-term equity exposure.";
            } else if (values.riskAppetite === 'medium') {
                recommendation += "- **ELSS (Equity Linked Savings Scheme):** Tax-saving scheme with a 3-year lock-in, invests in equity.\n- **Mid-Cap Equity Funds:** Investing in mid-sized companies with high growth potential.";
            } else { // high
                recommendation += "- **Small-Cap Equity Funds:** Highest risk and highest return potential, investing in small companies.\n- **International Equity Funds:** Diversify your portfolio globally, but subject to currency and geopolitical risks.";
            }
        }
        recommendation += "\n\n*Disclaimer: This is not real financial advice. Please consult with a certified financial advisor before making any investment decisions.*"
        setResult(recommendation);
    }
    
    return (
        <div className="p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <AlertTitle>Investment Fund Recommendations</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{result}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}

function FinancialExperts() {

    const experts = [
        { id: 1, name: "Alice Johnson", specialty: "Retirement Planning", rate: 150 },
        { id: 2, name: "Bob Williams", specialty: "Stock Market Analysis", rate: 200 },
        { id: 3, name: "Charlie Brown", specialty: "General Financial Advice", rate: 120 },
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
                Schedule a one-on-one video conference with a certified financial planner to get personalized advice.
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
