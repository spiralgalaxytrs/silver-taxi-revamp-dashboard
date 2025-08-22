import axios from "lib/http-common";
import type { 
  CustomNotification, 
  CreateCustomNotificationRequest, 
  UpdateCustomNotificationRequest,
  SendNotificationRequest,
  CustomNotificationResponse,
  CustomNotificationsPaginatedResponse 
} from "types/react-query/customNotification";

// 📥 Fetch all custom notifications
export const getCustomNotifications = async (): Promise<CustomNotificationsPaginatedResponse> => {
  const res = await axios.get("/v1/notifications/custom");
  console.log("Custom Notifications", res.data);
  return res.data;
};

// 📥 Fetch paginated custom notifications
export const getPageCustomNotifications = async (offset: number): Promise<CustomNotificationsPaginatedResponse> => {
  const res = await axios.get(`/v1/notifications/offset?offset=${offset}`);
  return res.data;
};

// 📥 Fetch single custom notification
export const getCustomNotification = async (templateId: string): Promise<CustomNotificationResponse> => {
  const res = await axios.get(`/v1/notifications/custom/${templateId}`);
  return res.data;
};

// ➕ Create custom notification
export const createCustomNotification = async (data: CreateCustomNotificationRequest): Promise<CustomNotificationResponse> => {
  // Prepare the request data
  const requestData: any = {
    title: data.title,
    message: data.message,
    target: data.target,
  };
  
  if (data.type) {
    requestData.type = data.type;
  }
  
  if (data.route) {
    requestData.route = data.route;
  }
  
  if (data.particularIds && data.particularIds.length > 0) {
    requestData.particularIds = data.particularIds;
  }
  
  if (data.targetAudience) {
    requestData.targetAudience = data.targetAudience;
  }
  
  if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
    requestData.targetCustomerIds = data.targetCustomerIds;
  }
  
  if (data.scheduledAt) {
    requestData.scheduledAt = data.scheduledAt;
  }
  
  if (data.time) {
    requestData.time = data.time;
  }

  // If there's an image, use FormData, otherwise use JSON
  if (data.image) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('message', data.message);
    formData.append('target', data.target);
    
    if (data.type) {
      formData.append('type', data.type);
    }
    
    if (data.route) {
      formData.append('route', data.route);
    }
    
    if (data.particularIds && data.particularIds.length > 0) {
      data.particularIds.forEach(id => formData.append('particularIds[]', id));
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    if (data.targetAudience) {
      formData.append('targetAudience', data.targetAudience);
    }
    
    if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
      data.targetCustomerIds.forEach(id => formData.append('targetCustomerIds[]', id));
    }
    
    if (data.scheduledAt) {
      formData.append('scheduledAt', data.scheduledAt);
    }
    
    if (data.time) {
      formData.append('time', data.time);
    }

    console.log("Form Data Entries (with image):");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await axios.post("/v1/notifications/custom", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } else {
    // Send as JSON
    console.log("JSON Data:", requestData);
    
    const res = await axios.post("/v1/notifications/custom", requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  }
};

// ✏️ Update custom notification
export const updateCustomNotification = async (templateId: string, data: UpdateCustomNotificationRequest): Promise<CustomNotificationResponse> => {
  // Prepare the request data
  const requestData: any = {};
  
  if (data.title) requestData.title = data.title;
  if (data.message) requestData.message = data.message;
  if (data.target) requestData.target = data.target;
  if (data.type) requestData.type = data.type;
  if (data.route) requestData.route = data.route;
  
  if (data.particularIds && data.particularIds.length > 0) {
    requestData.particularIds = data.particularIds;
  }
  
  if (data.targetAudience) {
    requestData.targetAudience = data.targetAudience;
  }
  
  if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
    requestData.targetCustomerIds = data.targetCustomerIds;
  }
  
  if (data.scheduledAt) {
    requestData.scheduledAt = data.scheduledAt;
  }
  
  if (data.time) {
    requestData.time = data.time;
  }

  // If there's an image, use FormData, otherwise use JSON
  if (data.image) {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.message) formData.append('message', data.message);
    if (data.target) formData.append('target', data.target);
    if (data.type) formData.append('type', data.type);
    if (data.route) formData.append('route', data.route);
    if (data.image) formData.append('image', data.image);
    
    if (data.particularIds && data.particularIds.length > 0) {
      data.particularIds.forEach(id => formData.append('particularIds[]', id));
    }
    
    if (data.targetAudience) {
      formData.append('targetAudience', data.targetAudience);
    }
    
    if (data.targetCustomerIds && data.targetCustomerIds.length > 0) {
      data.targetCustomerIds.forEach(id => formData.append('targetCustomerIds[]', id));
    }
    
    if (data.scheduledAt) {
      formData.append('scheduledAt', data.scheduledAt);
    }
    
    if (data.time) {
      formData.append('time', data.time);
    }

    const res = await axios.put(`/v1/notifications/custom/${templateId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } else {
    // Send as JSON
    const res = await axios.put(`/v1/notifications/custom/${templateId}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  }
};

// 🗑️ Delete custom notification
export const deleteCustomNotification = async (templateId: string): Promise<void> => {
  await axios.delete(`/v1/notifications/custom/${templateId}`);
};

// 📤 Send FCM notification to customers
export const sendCustomNotification = async (data: SendNotificationRequest): Promise<CustomNotificationResponse> => {
  const res = await axios.post(`/v1/notifications/custom/${data.templateId}/send`);
  return res.data;
};
