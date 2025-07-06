import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getEnquiries,
    getVendorEnquiries,
    getEnquiryById,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    toggleStatus,
    bulkDeleteEnquiries,
} from "services/enquiry";
import { Enquiry } from "types/react-query/enquiry";

export const useEnquiries = () =>
    useQuery<Enquiry[]>({
        queryKey: ["enquiries"],
        queryFn: getEnquiries,
        refetchIntervalInBackground: false,
        staleTime: 3 * 60 * 1000,
    });

export const useVendorEnquiries = () =>
    useQuery<Enquiry[]>({
        queryKey: ["vendor-enquiries"],
        queryFn: getVendorEnquiries,
        refetchIntervalInBackground: false,
        staleTime: 3 * 60 * 1000, 
    });

export const useEnquiryById = (id: string) =>
    useQuery<Enquiry>({
        queryKey: ["enquiry", id],
        queryFn: () => getEnquiryById(id),
        enabled: !!id,
    });

export const useCreateEnquiry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createEnquiry,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
    });
};

export const useUpdateEnquiry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateEnquiry,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
    });
};

export const useDeleteEnquiry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteEnquiry,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
    });
};

export const useToggleStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: toggleStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
    });
};

export const useBulkDeleteEnquiries = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: bulkDeleteEnquiries,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
    });
};
