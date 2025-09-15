export interface ConfigKey {
    id: number;
    keyName: string;
    keyValue: string;
    isPublic: boolean;
    description: string;
    status?: boolean;
    adminId?: string;
    createdAt?: string;
    updatedAt?: string;
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

export interface ConfigKeyFormData {
    keyName: string;
    keyValue: string;
    isPublic: boolean;
    description: string;
}
