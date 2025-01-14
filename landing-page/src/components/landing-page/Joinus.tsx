import { Icon } from "@iconify/react/dist/iconify.js";
export default function Joinus() {
   return (
      <section id="JoinUs">
         <div
            className="text-center w-full font-[family-name:var(--font-geist-mono)]"
         >
            <p className="md:text-6xl text-4xl font-extrabold mb-[48px]">Join Our Community</p>
            <p className="!font-sans md:text-3xl text-2xl font-bold dark:text-white text-white w-full px-32">
               Connect with fellow DeFAi farmers and cultivate collective growth in a harmonious ecosystem.
            </p>
            <div className="flex justify-center gap-5 !font-sans font-bold text-sm  sm:text-2xl mt-12">
               <a href="https://x.com/MeetAstroAI" target="_blank" className="bg-[#27aae1] p-5 rounded-full flex gap-2 items-center justify-between">
                  <Icon icon="akar-icons:twitter-fill" className="text-xl sm:text-4xl text-white" />
                  <span className="hidden md:inline text-white">Twitter</span>
               </a>
               <a href="https://t.me/+oh9HXznG6eg5ZTI1" target="_blank" className="bg-[#27aae1] p-5 rounded-full flex gap-2 items-center justify-between">
                  <Icon icon="teenyicons:telegram-outline" className="text-xl sm:text-4xl text-white" />
                  <span className="hidden md:inline text-white">Telegram</span>
               </a>
               <a href="https://www.tiktok.com/@meetastroai" target="_blank" className="bg-[#27aae1] p-5 rounded-full flex gap-2 items-center justify-between">
                  <Icon icon="simple-icons:tiktok" className="text-xl sm:text-4xl text-white" />
                  <span className="hidden md:inline text-white">Tiktok</span>
               </a>
               <a href="https://www.instagram.com/meetastroai" target="_blank" className="bg-[#27aae1] p-5 rounded-full flex gap-2 items-center justify-between">
                  <Icon icon="brandico:instagram-filled" className="text-xl sm:text-4xl text-white" />
                  <span className="hidden md:inline text-white">Instagram</span>
               </a>
            </div>
         </div>
      </section>
   );
}