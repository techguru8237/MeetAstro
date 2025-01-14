/* eslint-disable @next/next/no-img-element */
"use client"
import React from "react";
import Image from "next/image";

type ITEM = { 
   title: string,
   description: string,
}

const roadMapTitle: string[] = [
   "Foundation",
   "Development and Deployment",
   "Expansion",
   "Ecosystem Growth"
]

const _roadmaps: ITEM[][] = [
   [
      { 
         title: 'Research and development in AI, DeFi, and Gaming. (Completed)',
         description: ''
      }, 
      {
         title: 'Finalize the concept for MeetAstro. (Completed)',
         description: ''
      }, 
      {
         title: 'Initiate development of the MeetAstro MVP app. (Completed)',
         description: ''
      },
      {
         title: 'Launch social media presence. (Completed)',
         description: ''
      }
   ],
   [
      {
         title: 'Launch the official website.',
         description: ''
      },
      {
         title: 'Conduct quality assurance and security audits.',
         description: ''
      },
      {
         title: 'Deploy the MVP app, featuring Swap ATM, yield generator, and missions.',
         description: ''
      },
      {
         title: 'Kickstart marketing efforts.',
         description: ''
      },
   ],
   [
      {
         title: 'Introduce additional pre-planned features.',
         description: ''
      },
      {
         title: 'Launch the MeetAstro Marketplace.',
         description: ''
      },
      {
         title: 'Partnership announcements',
         description: ''
      },
      {
         title: 'Execute the Token Generation Event (TGE).',
         description: ''
      },
      {
         title: 'Secure listings on decentralized exchanges (DEX).',
         description: ''
      },
   ],
   [
      {
         title: 'Achieve listings on centralized exchanges (CEX).',
         description: ''
      },
      {
         title: 'Launch the fully immersive Astro Universe game.',
         description: ''
      },
      {
         title: 'Open the MeetAstro merchandise store.',
         description: ''
      },
      {
         title: 'Debut the MeetAstro animation series.',
         description: ''
      },
   ],
]

export default function Roadmap() {

   const _renderItem = (_items: ITEM[], index: number) => (
      <div key={'item' + index} className={`flex ${index % 2 === 0 && 'md:!flex-row-reverse'} flex-row-reverse md:flex-row justify-center gap-2 text-white md:-mt-20`}>
         <div className='w1300:w-[35%] lg:w-[45%] md:w-1/2 w-full rounded-3xl p-[1px] my-2 md:my-0'>
            <div className='w-full h-full p-10 rounded-3xl border-2 border-gray-400 bg-gray-300 bg-opacity-10 gap-y-12'>
               <h2 className="md:text-xl lg:text-2xl font-bold">Phase {index}: {roadMapTitle[index - 1]}</h2>
               {
                  _items.map((_item: ITEM) => (
                     <div key={index + '_' + _item.title} className="lg:text-lg md:text-sm mt-5">
                        <h3>- {_item.title}</h3>
                        {_item.description}
                     </div>
                  ))
               }
            </div>
         </div>
         <div className={`flex items-center px-8 justify-center relative flex-none md:py-10`}>
            <div className="bg-white h-full w-[1px] translate-x-1/2 z-0"></div>
            <div className="absolute w-[80px] h-[80px] flex-none z-10 rounded-full pl-1 dark:bg-transparent bg-transparent">
               <Image
                  src={`/assets/roadmap-${index}.png`}
                  alt='astro'
                  sizes='100vw'
                  height={100}
                  width={100}
                  className='rounded-full'
               />
            </div>
         </div>
         <div className='w1300:w-[35%] lg:w-[45%] md:w-1/2 w-full md:block hidden'></div>
      </div>
   )


   return (
      <section
         id="Roadmap"
         className="mx-2 md:mx-20"
      >
         <div className="font-[family-name:var(--font-geist-mono)]">
            <div className="md:mb-36 mb-20">
               <p className="md:text-6xl text-4xl text-center text-white font-extrabold">Our Roadmap</p>
            </div>
            {
               _roadmaps.map((_item: ITEM[], index: number) => _renderItem (_item, index + 1))
            }
         </div>
      </section>
   );
};

