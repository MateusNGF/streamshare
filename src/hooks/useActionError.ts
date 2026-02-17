import { useEffect } from "react";
import { useToast } from "./useToast";

/**
 * Hook to display an error toast if an error message is provided.
 * Useful for handling errors from Server Components passed down as props.
 */
export function useActionError(error?: string) {
    const toast = useToast();

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error, toast]);
}
