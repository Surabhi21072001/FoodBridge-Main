/**
 * Image Generator Utility
 * Generates placeholder images for food listings using SVG data URLs
 */

export const generateFoodImageUrl = (foodName: string, foodType: string): string => {
  const width = 400;
  const height = 300;

  // Map food types to colors for visual variety
  const colorMap: Record<string, { bg: string; text: string }> = {
    'Prepared Meal': { bg: '#FF6B6B', text: '#FFFFFF' },
    'Bakery': { bg: '#FFD93D', text: '#333333' },
    'Produce': { bg: '#6BCB77', text: '#FFFFFF' },
    'Dairy': { bg: '#F0F0F0', text: '#333333' },
    'Meat/Protein': { bg: '#D4A574', text: '#FFFFFF' },
    'Pantry Items': { bg: '#A8A8A8', text: '#FFFFFF' },
    'Beverages': { bg: '#4D96FF', text: '#FFFFFF' },
    'Other': { bg: '#9B59B6', text: '#FFFFFF' },
  };

  const colors = colorMap[foodType] || { bg: '#95A5A6', text: '#FFFFFF' };

  // Create SVG with food emoji and text
  const foodEmojis: Record<string, string> = {
    'Prepared Meal': '🍽️',
    'Bakery': '🥐',
    'Produce': '🥬',
    'Dairy': '🥛',
    'Meat/Protein': '🍗',
    'Pantry Items': '🥫',
    'Beverages': '🥤',
    'Other': '🍲',
  };

  const emoji = foodEmojis[foodType] || '🍽️';
  const truncatedName = foodName.length > 30 ? foodName.substring(0, 27) + '...' : foodName;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${colors.bg}"/>
      <text x="50%" y="35%" font-size="80" text-anchor="middle" dominant-baseline="middle">
        ${emoji}
      </text>
      <text x="50%" y="65%" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${colors.text}" font-family="Arial, sans-serif">
        ${truncatedName}
      </text>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
};

export const generateListingImageUrl = (listing: {
  food_name: string;
  food_type: string;
  listing_id: string;
}): string => {
  return generateFoodImageUrl(listing.food_name, listing.food_type);
};

/**
 * Generate a data URL for a canvas-based placeholder image
 * Useful for offline or custom styling
 */
export const generateCanvasPlaceholder = (
  text: string,
  width: number = 400,
  height: number = 300,
  bgColor: string = '#95A5A6'
): string => {
  if (typeof document === 'undefined') {
    // Fallback for server-side rendering
    return generateFoodImageUrl(text, 'Other');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return generateFoodImageUrl(text, 'Other');

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap text if needed
  const maxWidth = width - 40;
  const words = text.split(' ');
  let line = '';
  let y = height / 2 - 30;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[i] + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, width / 2, y);

  return canvas.toDataURL('image/png');
};
