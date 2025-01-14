
interface FaqProps {
   question: string;
   answer: string;
}
export default function FaqItem(props: FaqProps) {
   return (
      <div className="flex flex-col justify-start items-start h-full p-10">
         <div className="text-3xl font-bold mb-[20px]">
            {props.question}
         </div>
         <div className="text-gray-300">
            {props.answer}
         </div>
      </div>
   )
}