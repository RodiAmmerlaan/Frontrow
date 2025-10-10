/**
 * Utility functions for image selection
 */

import image1 from '../utils/eventImages/1.jpg';
import image2 from '../utils/eventImages/2.jpg';
import image3 from '../utils/eventImages/3.jpg';
import image4 from '../utils/eventImages/4.jpg';
import image5 from '../utils/eventImages/5.jpg';

export const getEventImages = () => [
    image1, image2, image3, image4, image5
];

export const selectImageForEvent = (eventId: string, assignedImage?: string) => {
    const eventImages = getEventImages();
    
    if (assignedImage) {
        return assignedImage;
    }
    
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
        const char = eventId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const imageIndex = Math.abs(hash) % eventImages.length;
    return eventImages[imageIndex];
};