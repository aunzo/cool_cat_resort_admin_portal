# Cool Cat Resort - Backoffice

A modern backoffice web application built with Next.js, Material-UI, TanStack Table, and Zod for managing Cool Cat Resort operations.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Material-UI (MUI)** - React component library for beautiful UI
- **TanStack Table** - Powerful data tables with sorting, filtering, and pagination
- **Zod** - TypeScript-first schema validation
- **TypeScript** - Type safety and better developer experience

## Features

### Dashboard
- Clean and modern sidebar navigation
- Responsive layout that works on all devices
- Material Design components for consistent UI

### Data Management
- **Advanced Data Table**: Built with TanStack Table featuring:
  - Global search/filtering
  - Column sorting
  - Pagination
  - Custom cell rendering (status chips, formatted dates, currency)
  - Responsive design

### Form Validation
- **Reservation Form**: Demonstrates Zod schema validation with:
  - Real-time field validation
  - Custom error messages
  - Type-safe form handling
  - Material-UI form components

### Sample Data
The application includes sample reservation data to demonstrate:
- Guest information management
- Reservation status tracking
- Room type categorization
- Date handling and formatting
- Currency formatting

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── DataTable.tsx      # TanStack Table implementation
│   │   └── ReservationForm.tsx # Zod-validated form
│   ├── layout.tsx             # Root layout with MUI theme
│   ├── page.tsx               # Main dashboard page
│   └── theme.ts               # MUI theme configuration
├── package.json
├── tsconfig.json
└── next.config.js
```

## Key Components

### DataTable Component
- Uses TanStack Table for advanced table functionality
- Implements global filtering, sorting, and pagination
- Custom cell renderers for different data types
- Responsive design with Material-UI components

### ReservationForm Component
- Zod schema validation for type safety
- Real-time validation feedback
- Material-UI form components
- Proper error handling and success states

### Theme Configuration
- Custom Material-UI theme
- Consistent color palette
- Typography settings
- Component style overrides

## Validation Schema

The application uses Zod for runtime type checking and validation:

```typescript
const ReservationSchema = z.object({
  id: z.string(),
  guestName: z.string(),
  email: z.string().email(),
  checkIn: z.string(),
  checkOut: z.string(),
  roomType: z.string(),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  totalAmount: z.number(),
})
```

## Future Enhancements

- Add authentication and authorization
- Implement real API integration
- Add more dashboard widgets and analytics
- Implement CRUD operations for reservations
- Add export functionality for data tables
- Implement real-time updates with WebSockets
- Add unit and integration tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.