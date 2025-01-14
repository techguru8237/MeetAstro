import * as motion from "motion/react-client"
export default function Search() {
   return (
      <motion.div 
         className="relative w-1/2 mx-auto rounded-full border-2 border-[#27aae1] bg-[#686969] bg-opacity-25 backdrop-blur-md"
      >
         <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-300 sr-only dark:text-white">Search</label>
         <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
            </div>
            <input 
               type="search" 
               id="default-search" 
               className="block w-full rounded-full p-4 ps-10 text-sm bg-transparent border-none focus:outline-none focus:ring-0" 
               placeholder="Ask Astro..."
            />
         </div>

      </motion.div>
   );
}