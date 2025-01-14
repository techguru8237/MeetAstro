"use client";
import React from "react";
import Image from "next/image";
import EnterButton from "../custom/enterbutton";
import HeaderItem from "../custom/headerItem";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function Header() {
   const [showDrop, setShowDrop] = React.useState(false);

   return (
      <header className="bg-[#0c111e] text-white fixed top-0 left-0 w-full px-4 py-2 z-50 font-[family-name:var(--font-geist-mono)]">
         <div className="hidden lg:flex justify-between items-center">
            <div className="flex items-center space-x-2">
               <Image
                  src="/assets/robot.png"
                  alt="Tailwind CSS"
                  width={48}
                  height={48}
               />
               <p className="font-bold text-lg">MeetAstro</p>
            </div>
            <div className="flex items-center space-x-12 justify-center">
               <HeaderItem title="About" />
               <HeaderItem title="Features" />
               <HeaderItem title="Roadmap" />
               <HeaderItem title="JoinUs" />
               <HeaderItem title="FAQs" />
            </div>
            <EnterButton title="Get Started" />
         </div>
         <div className="flex lg:hidden justify-between items-center">
            <div className="flex items-center space-x-2">
               <Image
                  src="/assets/robot.png"
                  alt="Tailwind CSS"
                  width={48}
                  height={48}
               />
               <p className="font-[family-name:var(--font-geist-mono)] font-bold text-lg">MeetAstro</p>
            </div>
            <div className="flex items-center space-x-2 justify-center font-[family-name:var(--font-geist-mono)]">
               <EnterButton title="Get Started" />
               <div className='lg:hidden block cursor-pointer hover:opacity-70'>
                  <Icon onClick={() => setShowDrop(!showDrop)} icon="ic:round-list" className='text-white text-4xl' />
               </div>
            </div>
            {
               showDrop &&
               <div className='absolute flex flex-col top-full right-0 px-10 py-5 lg:!hidden gap-3 justify-center items-center bg-[#0c111e]'>
                  <HeaderItem title="About" />
                  <HeaderItem title="Features" />
                  <HeaderItem title="Roadmap" />
                  <HeaderItem title="JoinUs" />
                  <HeaderItem title="FAQs" />
               </div>
            }
         </div>
      </header>
   );
}