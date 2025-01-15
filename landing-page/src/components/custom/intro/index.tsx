import "./index.css";
import * as motion from "motion/react-client";
export default function IntroTitle() {
   return (
      <motion.div 
         className="flex flex-col w-full justify-center items-center text-center 2xl:text-5xl xl:text-4xl lg:text-3xl md:text-2xl text-xs font-bold gap-4 font-[family-name:var(--font-geist-mono)]"
      >
         <div>
            <span id="astro">MeetAstro.ai</span> Is A Combination Of
         </div>
         <div>
            AI, GAMING, ENTERTAINMENT, AND DEFI
         </div>
         <div>
            All Wrapped One.
         </div>
         <div>
            We Call It <span id="defai">#DeFAi.</span>
         </div>
      </motion.div>
   );
}