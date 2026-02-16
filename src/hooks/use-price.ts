import { useCallback } from "react";

export const usePrice = () => {
    const formatPrice = useCallback((
        price: number | undefined | null,
        options: {
            currencyCode?: string;
            locale?: string;
        } = {}
    ) => {
        if (typeof price !== "number") return "";

        const { currencyCode = "USD", locale = "en-US" } = options;

        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currencyCode,
        }).format(price);
    }, []);

    return { formatPrice };
};
