import axios from 'lib/http-common';

export const calculateDistanceAndPrice = async (tariffId: string, pickupLocation: string, dropLocation: string) => {
  const res = await axios.post('/v1/distance-price', { tariffId, pickupLocation, dropLocation });
  return res.data.cals;
};
