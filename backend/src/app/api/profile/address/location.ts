import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import axios from 'axios';

export const getGeoCode = async (req: AuthRequest, res: Response) => {
    const { q } = req.query;

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
            q,
            format: 'json',
            limit: 1
        },
        headers: {
            'User-Agent': 'PangankuFreshApp/1.0 (contact@pangankufresh.com)'
        }
        });
        return res.json(response.data);
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