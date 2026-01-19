import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import axios from 'axios';

export const cleanAddress = (address: string): string => {
    return address
      .replace(/(Jl\.?|Jalan\.?|Jln\.?|No\.?|Kel\/Desa|Kec\.?)/gi, '')
      .replace(/\.$/, '')
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .join(', ');
  };
  

export const fetchCoordinates = async (query: string) => {
    const cleanedQuery = cleanAddress(query);
    console.log("Geocoding query:", cleanedQuery);
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
            q: query,
            format: 'json',
            limit: 1
        },
        headers: {
            'User-Agent': 'PangankuFreshApp/1.0 (contact@pangankufresh.com)'
        }
    });

    if (response.data && response.data.length > 0) {
        return {
            lat: parseFloat(response.data[0].lat),
            lon: parseFloat(response.data[0].lon)
        };
    }
    return null;
};

export const getGeoCode = async (req: any, res: Response) => {
    const { q } = req.query;
    try {
        const coords = await fetchCoordinates(q as string);
        return res.json(coords);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch location' });
    }
};

const STORE_LAT = -6.253669190045658;
const STORE_LNG = 107.08002424641867;
const MAX_DELIVERY_DISTANCE_KM = 10;

export const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const checkDeliveryRange = (userLat: number, userLng: number): { isInRange: boolean, distance: number } => {
    const distance = getHaversineDistance(STORE_LAT, STORE_LNG, userLat, userLng);
    return {
        isInRange: distance <= MAX_DELIVERY_DISTANCE_KM,
        distance: distance
    };
};