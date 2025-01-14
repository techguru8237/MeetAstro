import { Icon } from "@iconify/react/dist/iconify.js";
export default function Footer() {
   return (
      <footer className="w-full">
         <div className="bg-[#0c111e] text-white flex justify-between items-center py-4 px-10">
            <div className="text-sm">
               © 2025 MeetAstro. All rights reserved.
            </div>
            <div className="flex gap-3">
               <a href="https://x.com/MeetAstroAI" target="_blank" className="bg-[#27aae1] p-3 rounded-full flex gap-2 items-center justify-between bg-opacity-25 backdrop-blur-md">
                  <Icon icon="akar-icons:twitter-fill" className="text-xl sm:text-sm text-white" />
               </a>
               <a href="https://t.me/+oh9HXznG6eg5ZTI1" target="_blank" className="bg-[#27aae1] p-3 rounded-full flex gap-2 items-center justify-between bg-opacity-25 backdrop-blur-md">
                  <Icon icon="teenyicons:telegram-outline" className="text-xl sm:text-sm text-white" />
               </a>
               <a href="https://www.tiktok.com/@meetastroai" target="_blank" className="bg-[#27aae1] p-3 rounded-full flex gap-2 items-center justify-between bg-opacity-25 backdrop-blur-md">
                  <Icon icon="simple-icons:tiktok" className="text-xl sm:text-sm text-white" />
               </a>
               <a href="https://www.instagram.com/meetastroai" target="_blank" className="bg-[#27aae1] p-3 rounded-full flex gap-2 items-center justify-between bg-opacity-25 backdrop-blur-md">
                  <Icon icon="brandico:instagram-filled" className="text-xl sm:text-sm text-white" />
               </a>
            </div>
         </div>
      </footer>
   )
}