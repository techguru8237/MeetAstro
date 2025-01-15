import "../custom/css/featureitem.scss";
const Features = [
   {
      title: "SWAP ATM",
      description: "Just type to 'Astro' and He will Buy, Trade, and Sell tokens across multiple Blockchains with your Approval",
   },
   {
      title: "YIELD GENERATOR",
      description: "Just type to 'Astro' and He will simplify Borrowing, Lending, and Staking by executing all your trades on the backend with your Approval.",
   },
   {
      title: "TRADING",
      description: "Astro will execute any Trade you like by just typing to Him. View or cancel trades anytime!",
   },
   {
      title: "MISSIONS",
      description: "Send Astro on a mission to earn XP, gold, gems, credits, and tokens. These rewards can help reduce swap costs, boost yields, and More.",
   },
]
export default function Feature() {
   return (
      <section id="Features">
         <div className="flex flex-col flex-grow w-full h-full justify-center items-center px-14 font-[family-name:var(--font-geist-mono)] mt-20">
            <p className="md:text-6xl text-4xl font-extrabold mb-[64px]">Features</p>
            <div className="lg:grid lg:grid-rows-2 lg:grid-flow-col lg:gap-y-24 lg:gap-x-16 flex flex-col gap-8">
               {Features.map((Feature) => (
                  <div className="flex flex-col justify-start items-start h-full p-10 border-2 border-gray-400 rounded-3xl bg-gray-300 bg-opacity-10"
                     key={`${Feature.title}_key`}
                     id="feature"
                  >
                     <div className="text-4xl font-bold mb-[20px]">
                        {Feature.title}
                     </div>
                     <div className="text-gray-300">
                        {Feature.description}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}