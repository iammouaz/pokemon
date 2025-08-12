# Pokémon Explorer 🔍

A polished React application that explores the Pokémon universe using the PokéAPI. Discover, search, filter, and favorite your favorite Pokémon with a modern, responsive interface.

![Pokémon Explorer](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![React Query](https://img.shields.io/badge/React%20Query-5.0-ff4154?style=for-the-badge&logo=reactquery)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/iammouaz/pokemon.git

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏗️ Architecture & Design Decisions

### Technology Stack

**Frontend Framework**: Next.js 15 with App Router
- Chosen for its excellent TypeScript support, built-in optimization, and modern React patterns
- App Router provides better code organization and performance

**Styling**: TailwindCSS 
- Rapid development with utility classes
- Built-in dark mode support
- Consistent design system

**Data Fetching**: TanStack Query (React Query)
- Intelligent caching and background updates
- Built-in loading and error states
- Request deduplication and cancellation

**State Management**: React hooks + localStorage
- Minimal complexity for this scope
- localStorage for favorites persistence
- URL as source of truth for filters/search

### Key Architectural Decisions

#### 1. **Component Structure**
```
src/
├── components/
│   ├── layout/          # Header, navigation
│   ├── pokemon/         # Pokemon-specific components
│   ├── filters/         # Search and filtering
│   ├── ui/             # Reusable UI components
│   └── providers/      # Context providers
├── hooks/              # Custom React hooks
├── lib/               # Utilities and API functions
├── types/             # TypeScript definitions
└── app/               # Next.js app router pages
```

#### 2. **URL as Source of Truth**
- All filters, search queries, and pagination state are reflected in the URL
- Enables shareable links and browser back/forward navigation
- Implemented with Next.js `useSearchParams` and `useRouter`

#### 3. **Progressive Image Loading**
- Official artwork as primary source
- Automatic fallback to sprite images
- SVG placeholder for missing images
- Blur placeholders for smooth loading

#### 4. **Request Cancellation Strategy**
- AbortController integration with React Query
- Prevents race conditions during rapid filtering
- Improves performance and user experience

#### 5. **Accessibility-First Design**
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader optimizations
- Focus management

### Performance Optimizations

1. **Code Splitting**: Detail pages are dynamically imported
2. **Image Optimization**: Next.js Image component with proper sizing
3. **Query Optimization**: Intelligent caching with React Query
4. **Bundle Analysis**: Optimized imports and tree shaking
5. **Lazy Loading**: Images and components load progressively

## 🔧 Configuration

### Environment Variables
No environment variables required - the app uses the public PokéAPI.

### Customization

#### Theme Configuration
Modify `tailwind.config.js` to customize colors and styling:

```javascript
theme: {
  extend: {
    colors: {
      pokemon: {
        fire: '#F08030',
        water: '#6890F0',
        // Add custom type colors
      }
    }
  }
}
```

#### API Configuration
Update `src/lib/api.ts` to modify:
- Request timeouts
- Retry strategies
- Cache durations

## 📱 Features Walkthrough

### Home Page
- Grid layout of Pokémon cards with infinite scroll
- Real-time search with debouncing
- Type filtering and sorting options
- Responsive design for all screen sizes

### Detail Page (`/pokemon/:id`)
- Comprehensive Pokémon information
- Multiple image variants (normal/shiny)
- Interactive stats visualization
- Navigation between Pokémon
- Favorite toggle functionality

### Favorites Page (`/favorites`)
- Dedicated view for favorited Pokémon
- All search and filter capabilities
- Persistent across browser sessions

### Search & Filtering
- **Search**: Real-time with 300ms debounce
- **Type Filter**: Filter by Pokémon type
- **Sorting**: By ID, name, height, or weight
- **Favorites**: Toggle to show only favorites
- **URL Sync**: All state persisted in URL

### Dark Mode
- System preference detection
- Manual toggle in header
- Smooth color transitions
- Persistent preference storage

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Search functionality works with debouncing
- [ ] Filters persist in URL and on page reload
- [ ] Favorites toggle and persist in localStorage
- [ ] Dark mode toggle works and persists
- [ ] Images load with proper fallbacks
- [ ] Infinite scroll loads more Pokémon
- [ ] Detail pages show comprehensive information
- [ ] Error states display with retry options
- [ ] Loading states show during data fetching

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚧 Known Limitations & Trade-offs

### Current Limitations

1. **Search Scope**: Client-side search limited to loaded Pokémon (PokéAPI doesn't support server-side search)
2. **Image Availability**: Some Pokémon may have missing official artwork
3. **Offline Support**: No offline functionality (future enhancement)
4. **Type Filtering**: When filtering by type, pagination resets (API limitation)

### Design Trade-offs

1. **Client-side Search vs Server-side**: 
   - **Chosen**: Client-side with large initial load
   - **Trade-off**: Better UX but higher initial bandwidth
   - **Rationale**: PokéAPI lacks search endpoints

2. **localStorage vs Database**:
   - **Chosen**: localStorage for favorites
   - **Trade-off**: Data not synchronized across devices
   - **Rationale**: Simpler implementation, no backend required

3. **Infinite Scroll vs Pagination**:
   - **Chosen**: Infinite scroll with manual load more
   - **Trade-off**: Less precise navigation but better mobile UX
   - **Rationale**: Modern UX patterns, better for discovery

## 🔮 Future Enhancements

### Short-term (Next Sprint)
- [ ] Basic E2E tests with Playwright
- [ ] Error boundary implementation
- [ ] PWA capabilities (service worker, offline support)
- [ ] Pokémon comparison feature

### Medium-term
- [ ] Advanced filtering (stats, abilities, generations)
- [ ] Team builder functionality
- [ ] Export/import favorites
- [ ] Sound effects and animations

### Long-term
- [ ] User accounts with cloud sync
- [ ] Social features (share teams, favorites)
- [ ] Advanced analytics and insights
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commit messages
- Ensure accessibility compliance
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokéAPI](https://pokeapi.co/) for the comprehensive Pokémon data
- [Pokémon Sprites](https://github.com/PokeAPI/sprites) for the beautiful artwork
- [Lucide React](https://lucide.dev/) for the icon library
- [TanStack Query](https://tanstack.com/query) for excellent data fetching
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Built with ❤️ and ⚡ by [Your Name]**

*Gotta cache 'em all!* 🔥