export interface DateFilterParams {
    month?: number;
    year?: number;
}

/**
 * Builds a Prisma where clause for filtering data by date
 * @param params - The date filter parameters containing month and/or year
 * @returns A Prisma where clause object for date filtering
 */
export function buildDateFilterWhereClause(params: DateFilterParams): any {
    const whereClause: any = {};
    
    const { month, year } = params;
    
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        
        whereClause.created_at = {
            gte: startDate,
            lte: endDate
        };
    } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        
        whereClause.created_at = {
            gte: startDate,
            lte: endDate
        };
    }
    
    return whereClause;
}