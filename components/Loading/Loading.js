"use client";
import { motion } from "framer-motion";
import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-box">
        <motion.div
          className="ship-container"
          animate={{
            y: [5, -5, 5], 
            rotate: [-1.5, 1.5, -1.5], 
            x: [0, 20, 0], 
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img src="/images/ship.png" alt="Cruise Ship" className="ship" />
          <div className="river">
            <div className="waves"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
