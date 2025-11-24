import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpCommon from 'lib/http-common';

export interface ConfigKey {
    id: number;
    keyName: string;
    keyValue: string;
    isPublic: boolean;
    description: string;
}

export interface ConfigKeyInput {
    keyName: string;
    keyValue: string;
    isPublic: boolean;
    description: string;
}

export interface ConfigKeysResponse {
    success: boolean;
    message: string;
    data: ConfigKey[];
}

export interface StoreConfigKeysRequest {
    keys: ConfigKeyInput[];
    adminId?: string;
}

export interface StoreConfigKeysResponse {
    success: boolean;
    message: string;
}

// Get all config keys
export const useConfigKeys = () => {
    return useQuery<ConfigKeysResponse>({
        queryKey: ['configKeys'],
        queryFn: async () => {
            const response = await httpCommon.get('/v1/config-keys');
            return response.data;
        },
        enabled: false,
    });
};

// Store/Update config keys
export const useStoreConfigKeys = () => {
    const queryClient = useQueryClient();
    
    return useMutation<StoreConfigKeysResponse, Error, StoreConfigKeysRequest>({
        mutationFn: async (data) => {
            const response = await httpCommon.post('/v1/config-keys', data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch config keys
            queryClient.invalidateQueries({ queryKey: ['configKeys'] });
        },
    });
};
