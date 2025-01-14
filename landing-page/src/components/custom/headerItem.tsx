import * as motion from 'motion/react-client';

interface HeaderItemProps {
   title: string;
}
export default function HeaderItem({title}: HeaderItemProps) {
   const href = `#${title}`;
   return (
      <motion.p
         whileHover={{ scale: 1.2 }}
         whileTap={{ scale: 0.8 }}
      >
         <a href={href} className="hover:text-[#27aae1] font-bold">
            {title}
         </a>
      </motion.p>
   )
}