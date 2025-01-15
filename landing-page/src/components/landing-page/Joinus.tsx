import { Icon } from "@iconify/react/dist/iconify.js";
import "../custom/css/socialbutton.css";
export default function Joinus() {
   return (
      <section id="JoinUs">
         <div
            className="text-center w-full font-[family-name:var(--font-geist-mono)] mt-32"
         >
            <p className="md:text-6xl text-4xl font-extrabold mb-[48px]">Join Our Community</p>
            
            <div className="flex flex-wrap justify-center gap-5 font-bold text-sm  sm:text-2xl mt-12">
               <a href="https://x.com/MeetAstroAI" target="_blank" className="items-center justify-between">
                  <Icon icon="akar-icons:twitter-fill" id="twitter" />
                  {/* <span className="hidden md:inline text-white">Twitter</span> */}
               </a>
               <a href="https://t.me/+oh9HXznG6eg5ZTI1" target="_blank" className="items-center justify-between">
                  <Icon icon="teenyicons:telegram-outline"  id="telegram"/>
                  {/* <span className="hidden md:inline text-white">Telegram</span> */}
               </a>
               <a href="https://www.tiktok.com/@meetastroai" target="_blank" className="items-center justify-between">
                  <Icon icon="simple-icons:tiktok" id="tiktok"/>
                  {/* <span className="hidden md:inline text-white">Tiktok</span> */}
               </a>
               <a href="https://www.instagram.com/meetastroai" target="_blank" className="items-center justify-between">
                  <Icon icon="brandico:instagram-filled"  id="instagram"/>
                  {/* <span className="hidden md:inline text-white">Instagram</span> */}
               </a>
            </div>
            <p className="md:text-3xl sm:text-2xl text-md font-bold dark:text-white text-white w-4/5 mx-auto mt-12">
               Connect With Fellow DeFAi Farmers And Cultivate Collective Growth <br />In A Harmonious Ecosystem.
            </p>
         </div>
      </section>
   );
}