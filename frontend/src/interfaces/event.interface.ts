export interface EventOverview {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    total_tickets?: number;
    tickets_left?: number;
    price?: number;
    assignedImage?: string;
}