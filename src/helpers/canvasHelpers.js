// --------------------------------------------------------------------------
// Canvas/Calculation helpers
// --------------------------------------------------------------------------

// In 2D vector graphics:
// This function helps us manage sub-pixel rendering accuracy of edges
export function closestHalfPixel(pixels, pixelScale = 1){
  // Single-pixel stroke width must be drawn at a half-pixel position,
  // otherwise it gets sub-pixel blurring. 
  if (pixelScale == 1)
    return parseInt( 0.5 + pixels ) - 0.5; // parseInt is a hack for efficient rounding 
  // On retina displays, 2 retina-pixels are the same as 1 normal pixel.
  // In the case of drawing a 2-pixel stroke in Retina,
  // we actually want full-pixel positioning to avoid sub-pixel rendering.
  // If you actually want a 1-pixel stroke in Retina, simply leave 
  // pixelScale unspecified.
  else
    return Math.round(pixels)
}

export function drawLine(context, x1, y1, x2, y2, xyFlip, color) {
  if( color )
  {
    context.beginPath();
    context.strokeStyle = color;
  }

  if( xyFlip )
  {
    x1 = [y1, y1 = x1][0];
    x2 = [y2, y2 = x2][0];
  }
  context.moveTo( x1, y1 );
  context.lineTo( x2, y2 );

  if( color )
    context.stroke();
};

export function drawRoundedRectangle(context, left, right, top, bottom, radius, leftCutoff = false) {
  // Avoid artifacts with oversized corner radius
  radius = Math.min(radius, 0.5*(right - left))

  // Really small radius is negligible - draw a regular rectangle
  if (radius < 2) {
    if (context.fillStyle)
      context.fillRect(  left, top, right - left, bottom - top)
    if (context.strokeStyle)
      context.strokeRect(left, top, right - left, bottom - top)

  // Rounded Corners
  } else {
    context.beginPath()
    if (leftCutoff)
      context.moveTo(left, top)
    else
      context.moveTo(left + radius, top)
    context.lineTo(right - radius, top)
    context.quadraticCurveTo(right, top, right, top + radius)
    context.lineTo(right, bottom - radius)
    context.quadraticCurveTo(right, bottom, right - radius, bottom)
    if (leftCutoff) {
      context.lineTo(left, bottom)
      context.lineTo(left, top)
    } else {
      context.lineTo(left + radius, bottom)
      context.quadraticCurveTo(left, bottom, left, bottom - radius)
      context.lineTo(left, top + radius)
      context.quadraticCurveTo(left, top, left + radius, top)
    }
    context.closePath()
    if (context.fillStyle)
      context.fill()
    if (context.strokeStyle)
      context.stroke()
  }
}
