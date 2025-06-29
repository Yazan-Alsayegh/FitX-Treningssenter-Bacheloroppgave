// Authors: 7094, 7099 //

import React, { useState, useEffect } from "react";
import "./GymCapacity.css";

const GymCapacity = ({ isMobile = false }) => {
  const [gymStatus, setGymStatus] = useState({ count: 0, status: "Loading..." });

  useEffect(() => {
    // Function to calculate gym occupancy based on time
    const calculateGymCapacity = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const day = now.getDay(); 
      
      const lastUpdate = localStorage.getItem('gymLastUpdate');
      const storedOccupancy = localStorage.getItem('GymCapacity');
      
      if (lastUpdate && storedOccupancy) {
        const lastUpdateTime = parseInt(lastUpdate, 10);
        const currentTime = now.getTime();
        
        if (currentTime - lastUpdateTime < 15 * 60 * 1000) {
          return JSON.parse(storedOccupancy);
        }
      }
      
      const isWeekend = day === 0 || day === 6;
      
      let baseCount = 0;
      let status = "Closed";
      
      if (hour < 5) {
        baseCount = 0;
        status = "Closed";
      } 
      else if (hour >= 5 && hour < 7) {
        baseCount = 10;
        status = "Not Busy";
      } 
      else if (hour >= 7 && hour < 9) {
        if (isWeekend) {
          baseCount = 25;
          status = "Moderate";
        } else {
          baseCount = 50;
          status = "Busy";
        }
      } 
      else if (hour >= 9 && hour < 15) {
        baseCount = 25;
        status = "Moderate";
      } 
      else if (hour >= 15 && hour < 17) {
        baseCount = 35;
        status = "Moderate";
      }
      else if (hour >= 17 && hour < 20) {
        baseCount = 60;
        status = "Very Busy";
      } 
      else if (hour >= 20 && hour < 22) {
        baseCount = 30;
        status = "Moderate";
      } 
      else if (hour >= 22) {
        baseCount = 10;
        status = "Not Busy";
      }
      

      const variation = ((minute % 10) - 5);
      const count = Math.max(0, baseCount + variation);
      
      // Determine status based on count
      if (count === 0) {
        status = "Closed";
      } else if (count < 15) {
        status = "Not Busy";
      } else if (count < 40) {
        status = "Moderate";
      } else if (count < 60) {
        status = "Busy";
      } else {
        status = "Very Busy";
      }
      
      const occupancy = { count, status };
      
      localStorage.setItem('GymCapacity', JSON.stringify(occupancy));
      localStorage.setItem('gymLastUpdate', now.getTime().toString());
      
      return occupancy;
    };
    
    setGymStatus(calculateGymCapacity());
    
    const interval = setInterval(() => {
      setGymStatus(calculateGymCapacity());
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Busy": return "lightgreen";
      case "Moderate": return "orange";
      case "Busy": return "orangered";
      case "Very Busy": return "red";
      case "Closed": return "white";
      default: return "gray";
    }
  };

  const className = isMobile ? "gym-status-mobile" : "gym-status";

  return (
    <div className={className} style={{ color: getStatusColor(gymStatus.status) }}>
      {gymStatus.status === "Closed" ? (
        "GYM CLOSED"
      ) : (
        <>
          <span className="gym-count">{gymStatus.count}</span> PEOPLE • <span className="gym-busy-text">{gymStatus.status}</span>
        </>
      )}
    </div>
  );
};

export default GymCapacity;