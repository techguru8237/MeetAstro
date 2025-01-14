/* eslint-disable @next/next/no-img-element */
import React from "react";
import FaqItem from "../custom/faqItem";

type FAQ = {
  title: string,
  description: string
}

const faqs: FAQ[] = [
   {
      title: 'What is MeetAstro and how does it work?',
      description: 'MeetAstro is a gamified platform that integrates AI, decentralized finance (DeFi), and entertainment. Users interact with "Astro," your AI-powered companion that guides you through DeFi tools and experiences in a gamified way.'
   },
   {
      title: 'How does revenue sharing work?',
      description: 'MeetAstro redistributes platform earnings to active users through participation rewards. A portion of the revenue is pooled and distributed once certain thresholds are met.'
   },
   {
      title: 'What kind of missions can Astro undertake?',
      description: 'Astro can embark on missions which earn yield tokens, XP, and other rewards. Players can speed up missions by spending in-game gems.'
   },
   {
      title: 'How do social media and referrals contribute to rewards?',
      description: 'Users earn in-game currency by interacting with social media posts and referring others. The platform tracks interactions, and referrals yield bonuses based on user activity.'
   },
   {
      title: 'What is the long-term vision for MeetAstro?',
      description: 'MeetAstro plans to expand mission types, and enhance DeFi integration. Future updates will include more gamified elements, game modes, more defi features to increase user engagement and revenue distribution.'
   },
   
]

export default function Faq() {

   return (
      <section id="FAQs">
         <div className="align-top flex flex-col justify-center items-center px-20 font-[family-name:var(--font-geist-mono)]">
            <p className="md:text-6xl text-4xl font-extrabold mb-[64px]">FAQs</p>
            <div className="lg:grid lg:grid-rows-2 lg:grid-flow-col lg:gap-y-12 lg:gap-x-16 flex flex-col gap-8">
               {
                  faqs.map((_faq: FAQ) => <FaqItem key={_faq.title} question={_faq.title} answer={_faq.description}/>)
               }
            </div>
         </div>
      </section>
   );
};
