import "./index.css";

interface EnterButtonProps {
   title: string;
}
export default function EnterButton({ title }: EnterButtonProps) {
   return(
      <>
         <button className="shiny-cta px-2 py-2 sm:px-4 sm:py-2 md:px-6 md:py-2 lg:py-2 lg:px-6 xl:px-6 xl:py-3"
            // style={{
            //    paddingLeft: 20,
            //    paddingRight: 20,
            //    paddingTop: 10,
            //    paddingBottom: 10,
            // }}
         >
            <span className="font-[family-name:var(--font-geist-mono)] md:text-xl sm:text-md text-sm">{title}</span>
         </button>
      </>
   );
}