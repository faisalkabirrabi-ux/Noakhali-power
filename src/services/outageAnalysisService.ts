import { Upazila } from '../data';

export const getRestorationEstimate = (upazila: Upazila, concise: boolean = false): string => {
  if (upazila.status === 'ON') return concise ? "স্বাভাবিক" : "বিদ্যুৎ সরবরাহ স্বাভাবিক আছে।";
  if (upazila.maintenanceDetails) return concise ? upazila.maintenanceDetails.estimatedEndTime : `রক্ষণাবেক্ষণ চলছে, আনুমানিক শেষ সময়: ${upazila.maintenanceDetails.estimatedEndTime}`;

  // Simple heuristic: Calculate average load shedding hours from last 7 days
  const historical = upazila.historicalData;
  if (!historical || historical.length === 0) return "তথ্য অসম্পূর্ণ।";
  
  const avgHours = historical.reduce((acc, curr) => acc + curr.loadSheddingHours, 0) / historical.length;
  return concise ? `প্রায় ${avgHours.toFixed(1)} ঘণ্টা` : `পূর্বের গড় তথ্য অনুযায়ী ${avgHours.toFixed(1)} ঘণ্টার মধ্যে বিদ্যুৎ আসার সম্ভাবনা রয়েছে।`;
};
