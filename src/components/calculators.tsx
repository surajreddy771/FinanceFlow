
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { addMonths, format } from 'date-fns';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const translations = {
  en: {
    emiCalculator: {
      title: "Basic Loan / EMI Calculator",
      description: "Calculate your Equated Monthly Installment (EMI), total interest, and total payment.",
      loanAmount: "Loan Amount",
      interestRate: "Interest Rate (p.a.)",
      tenure: "Loan Tenure",
      repaymentFrequency: "Repayment Frequency",
      calculate: "Calculate",
      results: "Calculation Results",
      emi: "Your EMI",
      totalInterest: "Total Interest Payable",
      totalPayment: "Total Payment (Principal + Interest)",
      principal: "Principal",
      interest: "Interest",
      monthly: "Monthly",
      weekly: "Weekly",
      years: "Years",
      months: "Months",
    },
    cropLoan: {
      title: "Crop Loan / Seasonal Loan Planner",
      description: "Plan your crop loan with grace periods and repayment schedules aligned to your harvest.",
      gracePeriod: "Grace Period (in months)",
      repaymentStartDate: "Repayment Start Date",
      repaymentSchedule: "Repayment Schedule",
      dueDate: "Due Date",
      amountDue: "Amount Due",
    },
    livestock: {
      title: "Livestock Investment Return Calculator",
      description: "Helps farmers decide on goat/cow/poultry investments.",
      purchaseCost: "Purchase Cost per Animal",
      numberOfAnimals: "Number of Animals",
      feedCost: "Monthly Feed Cost per Animal",
      duration: "Investment Duration (months)",
      saleValue: "Expected Sale Value per Animal",
      totalPurchaseCost: "Total Purchase Cost",
      totalFeedCost: "Total Feed Cost",
      totalInvestment: "Total Investment",
      totalSaleValue: "Total Sale Value",
      estimatedProfitLoss: "Estimated Profit / Loss",
      breakEven: "Break-Even Point",
      breakEvenDescription: "You need to sell approximately {count} animals to cover your costs.",
      profit: "Profit",
      loss: "Loss",
    }
  },
  hi: {
    emiCalculator: {
      title: "मूल ऋण / ईएमआई कैलकुलेटर",
      description: "अपनी समान मासिक किस्त (ईएमआई), कुल ब्याज और कुल भुगतान की गणना करें।",
      loanAmount: "ऋण राशि",
      interestRate: "ब्याज दर (प्रति वर्ष)",
      tenure: "ऋण अवधि",
      repaymentFrequency: "चुकौती आवृत्ति",
      calculate: "गणना करें",
      results: "गणना परिणाम",
      emi: "आपकी ईएमआई",
      totalInterest: "कुल देय ब्याज",
      totalPayment: "कुल भुगतान (मूलधन + ब्याज)",
      principal: "मूलधन",
      interest: "ब्याज",
      monthly: "मासिक",
      weekly: "साप्ताहिक",
      years: "वर्ष",
      months: "महीने",
    },
    cropLoan: {
      title: "फसल ऋण / मौसमी ऋण योजनाकार",
      description: "अपनी फसल के अनुसार ग्रेस पीरियड और चुकौती कार्यक्रम के साथ अपने फसल ऋण की योजना बनाएं।",
      gracePeriod: "अनुग्रह अवधि (महीनों में)",
      repaymentStartDate: "चुकौती प्रारंभ तिथि",
      repaymentSchedule: "चुकौती अनुसूची",
      dueDate: "देय तिथि",
      amountDue: "देय राशि",
    },
     livestock: {
      title: "पशुधन निवेश रिटर्न कैलकुलेटर",
      description: "किसानों को बकरी/गाय/मुर्गी पालन निवेश पर निर्णय लेने में मदद करता है।",
      purchaseCost: "प्रति पशु खरीद लागत",
      numberOfAnimals: "पशुओं की संख्या",
      feedCost: "प्रति पशु मासिक चारा लागत",
      duration: "निवेश अवधि (महीने)",
      saleValue: "प्रति पशु अपेक्षित बिक्री मूल्य",
      totalPurchaseCost: "कुल खरीद लागत",
      totalFeedCost: "कुल चारा लागत",
      totalInvestment: "कुल निवेश",
      totalSaleValue: "कुल बिक्री मूल्य",
      estimatedProfitLoss: "अनुमानित लाभ / हानि",
      breakEven: "ब्रेक-ईवन पॉइंट",
      breakEvenDescription: "अपनी लागतों को कवर करने के लिए आपको लगभग {count} जानवरों को बेचने की आवश्यकता है।",
      profit: "लाभ",
      loss: "हानि",
    }
  },
};

const emiSchema = z.object({
  loanAmount: z.coerce.number().positive('Loan amount must be positive'),
  interestRate: z.coerce.number().positive('Interest rate must be positive'),
  tenure: z.coerce.number().positive('Tenure must be positive'),
  tenureType: z.enum(['years', 'months']),
  repaymentFrequency: z.enum(['monthly', 'weekly']),
  gracePeriod: z.coerce.number().min(0).optional(),
});

const livestockSchema = z.object({
    purchaseCost: z.coerce.number().positive(),
    numberOfAnimals: z.coerce.number().int().positive(),
    feedCost: z.coerce.number().positive(),
    duration: z.coerce.number().int().positive(),
    saleValue: z.coerce.number().positive(),
});


export function Calculators({ language = 'en' }: { language?: 'en' | 'hi' }) {
    const t = translations[language];
    return (
        <div className="p-4">
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger>{t.emiCalculator.title}</AccordionTrigger>
                    <AccordionContent>
                        <EMICalculator language={language} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>{t.cropLoan.title}</AccordionTrigger>
                    <AccordionContent>
                        <CropLoanCalculator language={language} />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                    <AccordionTrigger>{t.livestock.title}</AccordionTrigger>
                    <AccordionContent>
                        <LivestockInvestmentCalculator language={language} />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                    <AccordionTrigger>Fertilizer / Seed Purchase Planning Calculator</AccordionTrigger>
                    <AccordionContent>
                        <p className="p-4 text-muted-foreground">Coming soon...</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                    <AccordionTrigger>Debt Repayment Calculator</AccordionTrigger>
                    <AccordionContent>
                        <p className="p-4 text-muted-foreground">Coming soon...</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-6">
                    <AccordionTrigger>"Can I Afford This Loan?" Checker</AccordionTrigger>
                    <AccordionContent>
                        <p className="p-4 text-muted-foreground">Coming soon...</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-7">
                    <AccordionTrigger>Subsidy &amp; Scheme Estimator</AccordionTrigger>
                    <AccordionContent>
                         <p className="p-4 text-muted-foreground">Coming soon...</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}


function EMICalculator({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const t = translations[language].emiCalculator;
  const [results, setResults] = useState<{ emi: number; totalInterest: number; totalPayment: number; principal: number } | null>(null);

  const form = useForm<z.infer<typeof emiSchema>>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      loanAmount: 100000,
      interestRate: 10,
      tenure: 2,
      tenureType: 'years',
      repaymentFrequency: 'monthly',
    },
  });

  const onSubmit = (data: z.infer<typeof emiSchema>) => {
    const principal = data.loanAmount;
    const annualRate = data.interestRate / 100;
    
    let ratePerPeriod: number;
    let numberOfPeriods: number;

    const tenureInMonths = data.tenureType === 'years' ? data.tenure * 12 : data.tenure;

    if (data.repaymentFrequency === 'monthly') {
        ratePerPeriod = annualRate / 12;
        numberOfPeriods = tenureInMonths;
    } else { // weekly
        ratePerPeriod = annualRate / 52;
        numberOfPeriods = tenureInMonths * 4.33; // Approximate weeks in a month
    }

    const emi = (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPeriods)) / (Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1);
    const totalPayment = emi * numberOfPeriods;
    const totalInterest = totalPayment - principal;

    setResults({
      emi: isFinite(emi) ? emi : 0,
      totalInterest: isFinite(totalInterest) ? totalInterest : 0,
      totalPayment: isFinite(totalPayment) ? totalPayment : 0,
      principal,
    });
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: t.principal, value: results.principal },
      { name: t.interest, value: results.totalInterest },
    ];
  }, [results, t]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.loanAmount}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.interestRate}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                 <FormField
                    control={form.control}
                    name="tenure"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.tenure}</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="tenureType"
                    render={({ field }) => (
                    <FormItem className='self-end'>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="years">{t.years}</SelectItem>
                                <SelectItem value="months">{t.months}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="repaymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.repaymentFrequency}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">{t.monthly}</SelectItem>
                        <SelectItem value="weekly">{t.weekly}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">{t.calculate}</Button>
          </form>
        </Form>
        {results && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">{t.results}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">{results.repaymentFrequency === 'monthly' ? "Monthly EMI" : "Weekly Payment"}</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(results.emi)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">{t.totalInterest}</span>
                  <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">{t.totalPayment}</span>
                  <span className="font-semibold">{formatCurrency(results.totalPayment)}</span>
                </div>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        <Cell key="cell-0" fill="hsl(var(--chart-1))" />
                        <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CropLoanCalculator({ language = 'en' }: { language?: 'en' | 'hi' }) {
    const t = translations[language];
    const emiT = t.emiCalculator;
    const cropT = t.cropLoan;

    const [schedule, setSchedule] = useState<{ date: Date; amount: number }[] | null>(null);
    const [repaymentStartDate, setRepaymentStartDate] = useState<Date | null>(null);

    const form = useForm<z.infer<typeof emiSchema>>({
        resolver: zodResolver(emiSchema),
        defaultValues: {
            loanAmount: 50000,
            interestRate: 7,
            tenure: 12,
            tenureType: 'months',
            repaymentFrequency: 'monthly',
            gracePeriod: 6,
        },
    });

    const onSubmit = (data: z.infer<typeof emiSchema>) => {
        const principal = data.loanAmount;
        const annualRate = data.interestRate / 100;
        const tenureInMonths = data.tenureType === 'years' ? data.tenure * 12 : data.tenure;
        const gracePeriod = data.gracePeriod || 0;

        const monthlyRate = annualRate / 12;

        // Interest accumulated during grace period (simple interest)
        const graceInterest = principal * monthlyRate * gracePeriod;
        
        // New principal after grace period
        const newPrincipal = principal + graceInterest;

        const repaymentTenure = tenureInMonths - gracePeriod;
        if(repaymentTenure <= 0) {
            // Handle case where tenure is shorter than grace period
             setSchedule([]);
             setRepaymentStartDate(null);
             return;
        }

        const emi = (newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, repaymentTenure)) / (Math.pow(1 + monthlyRate, repaymentTenure) - 1);
        
        const startDate = addMonths(new Date(), gracePeriod);
        setRepaymentStartDate(startDate);

        const newSchedule = Array.from({ length: repaymentTenure }).map((_, i) => ({
            date: addMonths(startDate, i),
            amount: emi,
        }));
        setSchedule(newSchedule);
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardDescription>{cropT.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="loanAmount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{emiT.loanAmount}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{emiT.interestRate}</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="tenure"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{emiT.tenure}</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tenureType"
                            render={({ field }) => (
                            <FormItem className='self-end'>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="years">{emiT.years}</SelectItem>
                                        <SelectItem value="months">{emiT.months}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="gracePeriod"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{cropT.gracePeriod}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <Button type="submit">{emiT.calculate}</Button>
                </form>
                </Form>
                 {schedule && repaymentStartDate && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">{cropT.repaymentSchedule}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{cropT.repaymentStartDate}: {format(repaymentStartDate, 'PPP')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {schedule.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md text-sm">
                                    <span className="font-medium">{cropT.dueDate}: {format(item.date, 'PPP')}</span>
                                    <span className="font-semibold">{cropT.amountDue}: {formatCurrency(item.amount)}</span>
                                </div>
                            ))}
                           </div>
                            <div className="flex justify-center">
                                <Calendar
                                    mode="multiple"
                                    selected={schedule.map(s => s.date)}
                                    defaultMonth={repaymentStartDate}
                                    className="rounded-md border"
                                    classNames={{
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LivestockInvestmentCalculator({ language = 'en' }: { language?: 'en' | 'hi' }) {
    const t = translations[language].livestock;
    const emiT = translations[language].emiCalculator;
    const [results, setResults] = useState<{
        totalPurchaseCost: number;
        totalFeedCost: number;
        totalInvestment: number;
        totalSaleValue: number;
        estimatedProfitLoss: number;
        breakEven: number;
    } | null>(null);

    const form = useForm<z.infer<typeof livestockSchema>>({
        resolver: zodResolver(livestockSchema),
        defaultValues: {
            purchaseCost: 500,
            numberOfAnimals: 10,
            feedCost: 50,
            duration: 12,
            saleValue: 1200,
        },
    });

    const onSubmit = (data: z.infer<typeof livestockSchema>) => {
        const { purchaseCost, numberOfAnimals, feedCost, duration, saleValue } = data;
        const totalPurchaseCost = purchaseCost * numberOfAnimals;
        const totalFeedCost = feedCost * numberOfAnimals * duration;
        const totalInvestment = totalPurchaseCost + totalFeedCost;
        const totalSaleValue = saleValue * numberOfAnimals;
        const estimatedProfitLoss = totalSaleValue - totalInvestment;
        const breakEven = totalInvestment / saleValue;

        setResults({
            totalPurchaseCost,
            totalFeedCost,
            totalInvestment,
            totalSaleValue,
            estimatedProfitLoss,
            breakEven: isFinite(breakEven) ? breakEven : 0,
        });
    };

    const chartData = useMemo(() => {
        if (!results) return [];
        return [
            { name: t.totalPurchaseCost, value: results.totalPurchaseCost },
            { name: t.totalFeedCost, value: results.totalFeedCost },
        ];
    }, [results, t]);

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                <FormItem><FormLabel>{t.purchaseCost}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="numberOfAnimals" render={({ field }) => (
                                <FormItem><FormLabel>{t.numberOfAnimals}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="feedCost" render={({ field }) => (
                                <FormItem><FormLabel>{t.feedCost}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="duration" render={({ field }) => (
                                <FormItem><FormLabel>{t.duration}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="saleValue" render={({ field }) => (
                                <FormItem><FormLabel>{t.saleValue}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <Button type="submit">{emiT.calculate}</Button>
                    </form>
                </Form>
                {results && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">{emiT.results}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                <div className={`flex justify-between items-center p-3 rounded-md ${results.estimatedProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <span className="font-medium">{t.estimatedProfitLoss}</span>
                                    <span className={`font-bold text-lg ${results.estimatedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(results.estimatedProfitLoss)} ({results.estimatedProfitLoss >= 0 ? t.profit : t.loss})</span>
                                </div>
                                 <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                    <span className="font-medium">{t.totalInvestment}</span>
                                    <span className="font-semibold">{formatCurrency(results.totalInvestment)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                    <span className="font-medium">{t.totalSaleValue}</span>
                                    <span className="font-semibold">{formatCurrency(results.totalSaleValue)}</span>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                    <p className="font-medium">{t.breakEven}</p>
                                    <p className="text-sm">{t.breakEvenDescription.replace('{count}', Math.ceil(results.breakEven).toString())}</p>
                                </div>
                            </div>
                            <div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            <Cell key="cell-0" fill="hsl(var(--chart-4))" />
                                            <Cell key="cell-1" fill="hsl(var(--chart-5))" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    

  