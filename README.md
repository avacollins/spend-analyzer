# 📊 Political Ad Spend Analyzer

A Next.js application for analyzing and visualizing political advertising spending data. This tool allows users to upload CSV files containing political ad spending data and provides interactive charts and analytics.

## 🌟 Features

- **CSV Data Upload**: Upload and parse political advertising spending data
- **Data Normalization**: Automatic cleaning and standardization of data
- **Interactive Charts**: Dynamic bar charts and pie charts using Nivo
- **Advanced Filtering**: Filter data by advertiser, election, topic, and time period
- **Real-time Analytics**: Live data processing and visualization
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Redux State Management**: Efficient data management and caching
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.4
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Charts**: Nivo (Bar, Pie, Line charts)
- **State Management**: Redux Toolkit
- **CSV Parsing**: PapaParse
- **Testing**: Jest with Testing Library
- **Styling**: Emotion CSS-in-JS

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spend-analyzer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐳 Docker Deployment

### Quick Start with Docker

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t spend-analyzer .

# Run the container
docker run -p 3000:3000 spend-analyzer
```

### Using Docker Compose

```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the application
docker-compose down
```

### Development with Docker

For development with hot-reload:

```bash
# Update docker-compose.yml to use the dev service
# Then run:
docker-compose -f docker-compose.yml up spend-analyzer-dev
```

## 📊 Usage

1. **Upload Data**: Click the upload button and select a CSV file containing political ad spending data
2. **Explore Visualizations**: Use the interactive charts to analyze spending patterns
3. **Apply Filters**: Filter data by advertiser, election type, topic, and time period
4. **Dynamic Queries**: Configure primary and secondary groupings for custom analysis
5. **Export Results**: View summary statistics and insights

### Expected CSV Format

The application expects CSV files with the following columns:
- `advertiser`: Name of the advertising entity
- `election`: Election type or identifier
- `topic`: Advertising topic or category
- `spend`: Spending amount
- `spend_week`: Weekly spending data
- `spend_month`: Monthly spending data

## 🧪 Testing

Run the test suite:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Current test coverage for data utilities: **100%**

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── DataLoader.tsx   # CSV upload and processing
│   │   ├── QueryChart.tsx   # Interactive charts
│   │   └── ReduxProvider.tsx
│   ├── store/              # Redux store and slices
│   │   ├── dataSlice.ts    # Data state management
│   │   ├── hooks.ts        # Typed Redux hooks
│   │   └── store.ts        # Store configuration
│   ├── utils/              # Utility functions
│   │   ├── dataTransform.ts # Data normalization
│   │   └── __tests__/      # Unit tests
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── public/
│   └── dataset.csv         # Sample data file
└── ...
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Add any environment variables here
NEXT_TELEMETRY_DISABLED=1
```

### Next.js Configuration

The application is configured with:
- Standalone output for Docker deployment
- TypeScript support
- ESLint configuration

## 📈 Features in Detail

### Data Processing
- Automatic data normalization and cleaning
- Duplicate detection and removal
- Standardization of political terms and categories

### Visualization Options
- **Bar Charts**: Compare spending across categories
- **Pie Charts**: Show spending distribution
- **Dynamic Grouping**: Primary and secondary data grouping
- **Interactive Tooltips**: Detailed spending information

### Filtering Capabilities
- Filter by advertiser name
- Filter by election type
- Filter by topic/category
- Real-time filter updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Nivo Charts](https://nivo.rocks/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 Support

For questions or support, please contact the development team.
