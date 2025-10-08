"use client";

import { BookOpen, Newspaper, Video } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import ImageData from '@/app/lib/placeholder-images.json'

const learnContent = {
  en: {
    title: "Financial Literacy Corner",
    description: "Empower yourself with knowledge. Browse articles and videos to improve your financial health.",
    articles: [
      {
        title: "Understanding Mutual Funds",
        description: "A beginner's guide to how mutual funds work, their types, and how to invest in them.",
        icon: Newspaper,
        image: ImageData.articles.mutualFunds.src,
        aiHint: ImageData.articles.mutualFunds.aiHint,
        link: "#"
      },
      {
        title: "Basics of Kisan Credit Card (KCC)",
        description: "Learn about the features, benefits, and application process for the Kisan Credit Card scheme.",
        icon: Newspaper,
        image: ImageData.articles.kisanCreditCard.src,
        aiHint: ImageData.articles.kisanCreditCard.aiHint,
        link: "#"
      },
       {
        title: "The Power of Compounding",
        description: "Discover how the magic of compounding can significantly grow your wealth over time.",
        icon: Newspaper,
        image: ImageData.articles.powerOfCompounding.src,
        aiHint: ImageData.articles.powerOfCompounding.aiHint,
        link: "#"
      },
      {
        title: "Credit Score 101",
        description: "What is a credit score, why does it matter, and how can you improve yours?",
        icon: Newspaper,
        image: ImageData.articles.creditScore.src,
        aiHint: ImageData.articles.creditScore.aiHint,
        link: "#"
      },
    ],
    videos: [
        {
        title: "Video: Budgeting 101 for Families",
        description: "A short video explaining how to create and stick to a family budget effectively.",
        icon: Video,
        image: ImageData.videos.budgeting.src,
        aiHint: ImageData.videos.budgeting.aiHint,
        link: "#"
      },
      {
        title: "Video: Crop Insurance Explained",
        description: "Understand the importance of crop insurance and how it can protect you from financial losses.",
        icon: Video,
        image: ImageData.videos.cropInsurance.src,
        aiHint: ImageData.videos.cropInsurance.aiHint,
        link: "#"
      },
      {
        title: "Video: Stock Market for Beginners",
        description: "A simple introduction to the stock market and how you can start investing.",
        icon: Video,
        image: ImageData.videos.stockMarket.src,
        aiHint: ImageData.videos.stockMarket.aiHint,
        link: "#"
      },
      {
        title: "Video: Why You Need an Emergency Fund",
        description: "Learn how to build a financial safety net for unexpected life events.",
        icon: Video,
        image: ImageData.videos.emergencyFund.src,
        aiHint: ImageData.videos.emergencyFund.aiHint,
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
        image: ImageData.articles.mutualFunds.src,
        aiHint: ImageData.articles.mutualFunds.aiHint,
        link: "#"
      },
      {
        title: "किसान क्रेडिट कार्ड (KCC) की मूल बातें",
        description: "किसान क्रेडिट कार्ड योजना की विशेषताओं, लाभों और आवेदन प्रक्रिया के बारे में जानें।",
        icon: Newspaper,
        image: ImageData.articles.kisanCreditCard.src,
        aiHint: ImageData.articles.kisanCreditCard.aiHint,
        link: "#"
      },
      {
        title: "चक्रवृद्धि की शक्ति",
        description: "जानें कि कैसे चक्रवृद्धि का जादू समय के साथ आपकी संपत्ति को महत्वपूर्ण रूप से बढ़ा सकता है।",
        icon: Newspaper,
        image: ImageData.articles.powerOfCompounding.src,
        aiHint: ImageData.articles.powerOfCompounding.aiHint,
        link: "#"
      },
      {
        title: "क्रेडिट स्कोर 101",
        description: "क्रेडिट स्कोर क्या है, यह क्यों मायने रखता है, और आप अपना कैसे सुधार सकते हैं?",
        icon: Newspaper,
        image: ImageData.articles.creditScore.src,
        aiHint: ImageData.articles.creditScore.aiHint,
        link: "#"
      },
    ],
    videos: [
        {
        title: "वीडियो: परिवारों के लिए बजट 101",
        description: "एक छोटा वीडियो जो बताता है कि परिवार का बजट प्रभावी ढंग से कैसे बनाया जाए और उसका पालन कैसे किया जाए।",
        icon: Video,
        image: ImageData.videos.budgeting.src,
        aiHint: ImageData.videos.budgeting.aiHint,
        link: "#"
      },
      {
        title: "वीडियो: फसल बीमा समझाया गया",
        description: "फसल बीमा के महत्व को समझें और यह आपको वित्तीय नुकसान से कैसे बचा सकता है।",
        icon: Video,
        image: ImageData.videos.cropInsurance.src,
        aiHint: ImageData.videos.cropInsurance.aiHint,
        link: "#"
      },
      {
        title: "वीडियो: शुरुआती लोगों के लिए शेयर बाजार",
        description: "शेयर बाजार का एक सरल परिचय और आप निवेश कैसे शुरू कर सकते हैं।",
        icon: Video,
        image: ImageData.videos.stockMarket.src,
        aiHint: ImageData.videos.stockMarket.aiHint,
        link: "#"
      },
      {
        title: "वीडियो: आपको आपातकालीन निधि की आवश्यकता क्यों है",
        description: "अप्रत्याशित जीवन की घटनाओं के लिए वित्तीय सुरक्षा जाल बनाना सीखें।",
        icon: Video,
        image: ImageData.videos.emergencyFund.src,
        aiHint: ImageData.videos.emergencyFund.aiHint,
        link: "#"
      }
    ]
  }
}

export function LearnSection({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const content = learnContent[language];

  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2"><BookOpen/> {content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <h4 className="text-xl font-semibold mb-4">Articles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.articles.map((item) => (
                    <Card key={item.title} className="overflow-hidden">
                    <Image src={item.image} alt={item.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={item.aiHint}/>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><item.icon className="h-5 w-5"/> {item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.videos.map((item) => (
                    <Card key={item.title} className="overflow-hidden">
                    <Image src={item.image} alt={item.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={item.aiHint}/>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><item.icon className="h-5 w-5"/> {item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
        </CardContent>
    </Card>
  );
}
