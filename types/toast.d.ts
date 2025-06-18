export interface ToastState{
    open: boolean;
    title: string;
    description: string | null;
    variant: "default" | "destructive";
}