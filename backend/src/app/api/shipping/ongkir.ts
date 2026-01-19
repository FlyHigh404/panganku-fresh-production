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

export const estimateShippingCost = async (req: any, res: Response) => {
  try {
    const { addressId } = req.query;

    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    const address = await prisma.address.findUnique({
      where: { id: String(addressId) }
    });

    if (!address || !address.note) {
      return res.status(404).json({ error: "Address or coordinates not found" });
    }

    const coords = parseCoordinates(address.note);
    if (!coords) {
      console.log("Coords not found in notes, attempting geocode fallback...");
      
      // using geocode
      const query = encodeURIComponent(address.fullAddress);
      fetchCoordinates(query)

      return res.status(400).json({ error: "Invalid coordinate format in notes" });
    }

    const distance = getHaversineDistance(STORE_LAT, STORE_LNG, coords.lat, coords.lon);

    let shipCost = 0;
    if (distance > 3 && distance <= 7) {
      shipCost = 7000;
    } else if (distance > 7 && distance <= 10) {
      shipCost = 10000;
    } else if (distance > 10) {
      // Added a fallback for very far distances
      shipCost = 15000 + (Math.floor(distance - 10) * 2000); 
    }
    
    return res.status(200).json({
      distance: parseFloat(distance.toFixed(2)), // km
      shippingCost: shipCost
    });

  } catch (error) {
    console.error("Shipping Estimation Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};