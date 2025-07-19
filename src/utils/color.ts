export function isLightColor(hexColor: string) {
  // Convert hex color to RGB values
  if (!hexColor) return true
  const red = parseInt(hexColor.substring(1, 3), 16)
  const green = parseInt(hexColor.substring(3, 5), 16)
  const blue = parseInt(hexColor.substring(5, 7), 16)

  // Calculate luminance
  const luminance = red * 0.299 + green * 0.587 + blue * 0.114

  // Check if luminance is greater than 186
  return luminance > 186
}