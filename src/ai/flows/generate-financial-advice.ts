'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized financial advice based on user spending habits and savings goals.
 *
 * - generateFinancialAdvice - A function that initiates the financial advice generation process.
 * - FinancialAdviceInput - The input type for the generateFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the generateFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAdviceInputSchema = z.object({
  spendingHabits: z
    .string()
    .describe('A detailed summary of the user\'s spending habits.'),
  savingsGoals: z
    .string()
    .describe('A description of the user\'s savings goals, including target amounts and timelines.'),
  income: z.number().describe('The user\'s monthly income.'),
  budget: z.number().describe('The user\'s monthly budget.'),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

const FinancialAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Personalized financial advice based on the user\'s spending habits and savings goals.'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function generateFinancialAdvice(
  input: FinancialAdviceInput
): Promise<FinancialAdviceOutput> {
  return generateFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's spending habits, savings goals, income, and budget, provide personalized financial advice.

Spending Habits: {{{spendingHabits}}}
Savings Goals: {{{savingsGoals}}}
Income: {{{income}}}
Budget: {{{budget}}}

Provide specific and actionable recommendations to help the user improve their financial situation and achieve their savings goals.`,
});

const generateFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'generateFinancialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
    outputSchema: FinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
