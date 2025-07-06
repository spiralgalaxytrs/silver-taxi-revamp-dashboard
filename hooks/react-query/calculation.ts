import { useMutation } from '@tanstack/react-query';
import { calculateDistanceAndPrice } from 'services/calculation';

export const useDistancePriceCalculation = () => {
  return useMutation({
    mutationFn: ({
      tariffId,
      pickupLocation,
      dropLocation,
    }: {
      tariffId: string;
      pickupLocation: string;
      dropLocation: string;
    }) => calculateDistanceAndPrice(tariffId, pickupLocation, dropLocation),
  });
};
