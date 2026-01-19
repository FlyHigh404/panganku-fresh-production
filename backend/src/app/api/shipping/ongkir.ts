import { response, Response } from "express";
import { getHaversineDistance, fetchCoordinates } from "./location";
import { prisma } from "../../../lib/prisma";

const STORE_LAT = -6.253669190045658;
const STORE_LNG = 107.08002424641867;

export const parseCoordinates = (note: string): { lat: number; lon: number } | null => {
  const match = note.match(/coords:\s*(-?\d+\.\d+):(-?\d+\.\d+)/);
  if (!match) return null;
  return {
    lat: parseFloat(match[1]),
    lon: parseFloat(match[2])
  };
};

export async function calculateShippingCostInternal(addressId: string): Promise<{ distance: number, shippingCost: number }> {
  const address = await prisma.address.findUnique({
      where: { id: addressId },
  });

  if (!address) {
      return { distance: Infinity, shippingCost: 0 }; 
  }

  let coords = parseCoordinates(address.note || "");
  
  if (!coords) {
      console.log("Coords not found in notes, attempting geocode fallback...");
      coords = await fetchCoordinates(address.fullAddress);      
      
      if (coords) {
          await prisma.address.update({
              where: { id: address.id },
              data: { note: (address.note || "") + ` coords: ${coords.lat}:${coords.lon}` },
          });
      }
  }

  if (!coords) {
       // Assuming 50km is max deliverable distance, or a failure state
       return { distance: 50, shippingCost: 99999 }; 
  }

  const distance = getHaversineDistance(STORE_LAT, STORE_LNG, coords.lat, coords.lon);

  let shipCost = 0;
  if (distance > 3 && distance <= 7) {
      shipCost = 7000;
  } else if (distance > 7 && distance <= 10) {
      shipCost = 10000;
  } else if (distance > 10 && distance <= 50) { // Set a reasonable limit
      shipCost = 15000 + (Math.floor(distance - 10) * 2000);
  } else if (distance > 50) {
      // Handle undeliverable distance - maybe set cost to 0 and handle refusal later
      shipCost = 0; 
  }

  return {
      distance: parseFloat(distance.toFixed(2)),
      shippingCost: shipCost
  };
}

export const estimateShippingCost = async (req: any, res: Response) => {
  try {
    const { addressId } = req.query;

    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    const result = await calculateShippingCostInternal(String(addressId)); 

    if (result.shippingCost === 0 && result.distance > 50) {
        return res.status(400).json({ error: "Address is outside our delivery zone." });
    }
    
    return res.status(200).json(result);

  } catch (error) {
    console.error("Shipping Estimation Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};