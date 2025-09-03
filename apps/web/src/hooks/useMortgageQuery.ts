import { useQuery } from '@tanstack/react-query';
import { computeMortgage } from '../lib/mortgageMath';
import type { MortgageInput, MortgageResult } from '../lib/types/mortgage';

export const useMortgageQuery = (input: MortgageInput | null) => {
  return useQuery<MortgageResult>({
    queryKey: ['mortgage-schedule', input],
    queryFn: () => {
      if (!input) throw new Error('Missing input');
      return computeMortgage(input);
    },
    enabled: !!input,
    staleTime: Infinity,
  });
};
