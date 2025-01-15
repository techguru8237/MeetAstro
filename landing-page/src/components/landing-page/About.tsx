"use client"
import Image from "next/image";
import Search from "../custom/searchBar";
import React from "react";
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
// import * as THREE from 'three';

// function Model() {
//    const { scene, animations } = useGLTF('/assets/model.glb');
//    const { actions } = useAnimations(animations, scene);
//    console.log(actions);
//    React.useEffect(() => {
//       if(actions) {
//          actions.idle?.setLoop(THREE.LoopRepeat, Infinity);
//          actions.idle?.play();
//       }
//    }, [actions]);
//    return <primitive object={scene} scale={2} position={[0, -2, 0]}/>;
// };
export default function Astro() {
   return (
      <section id="About">
         <div className="bg-[url('/assets/about.jpg')] bg-no-repeat bg-cover bg-center h-screen w-full flex flex-col justify-between items-center lg:pt-24 lg:pb-12 px-12 pb-20 pt-24 font-[family-name:var(--font-geist-mono)]"
         >
            <div className="flex lg:text-8xl md:text-6xl text-4xl font-bold">
               Meet Astro
            </div>
            <div className="w-full h-2/3 flex flex-row justify-between items-center">
               {/* <div className="flex w-full justify-center items-center h-full"> */}
                  <div className="relative w-full h-full">
                     <Image
                        src={`/assets/astro_about.png`}
                        alt='astro'
                        layout="fill"
                        objectFit="contain"
                        className="relative"
                     />
                     {/* <Canvas>
                        <ambientLight intensity={3} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
                        <spotLight position={[15, 20, 5]} angle={0.3} intensity={0.8} />
                        <Model />
                     </Canvas> */}
                  </div>
               {/* </div> */}
               {/* <div className="md:w-2/3 w-full flex flex-col justify-between items-center">
                  <div className="relative flex w-full">
                     <Image
                        src={`/assets/dialog.png`}
                        alt='dialog'
                        height={640}
                        width={640}
                        layout="responsive"
                        sizes="100vw"
                        className='relative'
                     />
                     <div className="absolute flex flex-col justify-center items-center font-bold text-gray-300 2xl:text-5xl 2xl:top-[160px] xl:top-[80px] lg:top-[40px] lg:text-lg xl:text-2xl top-[50px] left-[30px] md:text-md 2xl:px-[60px] xl:px-[48px] lg:px-[20px] px-[12px]"
                     >
                        MeetAstro.ai is a combination of AI, gaming, entertainment, and decentralized finance (DeFi) all wrapped into one. We call it #DeFAi.
                     </div>
                  </div>
               </div> */}
            </div>
            <Search />
         </div>
      </section>
   );
}