# Images Assets

This folder contains all local images and visual assets for the Cool Cat Resort application.

## Folder Structure

### `/logos`
- Company logos
- Brand marks
- Logo variations (light/dark themes)
- Partner logos

### `/icons`
- Custom icons
- UI icons
- Feature icons
- Navigation icons

### `/backgrounds`
- Hero images
- Background patterns
- Texture images
- Banner images

## File Naming Conventions

- Use lowercase letters
- Use hyphens (-) instead of spaces
- Include descriptive names
- Add size suffix when applicable (e.g., `logo-small.png`, `logo-large.png`)

### Examples:
- `cool-cat-logo.svg`
- `room-icon.png`
- `hero-background.jpg`
- `pattern-texture.png`

## Supported Formats

- **SVG**: Preferred for logos and icons (scalable)
- **PNG**: For images with transparency
- **JPG/JPEG**: For photographs and complex images
- **WebP**: For optimized web images

## Usage in Components

```tsx
import logoImage from '@/assets/images/logos/cool-cat-logo.svg'
import roomIcon from '@/assets/images/icons/room-icon.png'

// In your component
<img src={logoImage} alt="Cool Cat Resort Logo" />
```

## Optimization Guidelines

1. **Compress images** before adding them to the project
2. **Use appropriate formats** (SVG for vectors, WebP for web optimization)
3. **Provide alt text** for accessibility
4. **Consider responsive images** for different screen sizes
5. **Keep file sizes reasonable** (< 1MB for most images)

## Notes

- All images should be optimized for web use
- Consider creating multiple sizes for responsive design
- Use descriptive file names for better organization
- Update this README when adding new categories