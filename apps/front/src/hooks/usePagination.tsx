import { useState } from 'react';

export const usePagination = <T,>(items:Array<T>, itemsPerPage:number) => {
    const [page, onChange] = useState<number>(1);
    const total= Math.ceil((items.length ?? 1) / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const itemsToDisplay = (items).slice(start, start + itemsPerPage);
    return {
        page,
        onChange,
        total,
        itemsToDisplay
    };
};