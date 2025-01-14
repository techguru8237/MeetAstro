import "./index.css";

interface EnterButtonProps {
   title: string;
}
export default function EnterButton({ title }: EnterButtonProps) {
   return(
      <>
         <button className="shiny-cta p-0"
            style={{
               paddingLeft: 20,
               paddingRight: 20,
               paddingTop: 10,
               paddingBottom: 10,
            }}
         >
            <span className="font-[family-name:var(--font-geist-mono)]">{title}</span>
         </button>
      </>
   );
}