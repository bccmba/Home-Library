# My Home Library

A beautiful, mobile-first personal home library app where you can scan book barcodes to catalog your physical book collection onto virtual bookshelves.

## Overview

**Purpose:** Help book lovers organize their physical book collections digitally with zero typing - just scan and shelve.

**Current State:** Frontend prototype complete with in-memory storage.

## Architecture

### Frontend (Expo React Native)
- **Navigation:** Tab-based with Library, Scan, and Profile tabs
- **Screens:**
  - Library Home: Stats and shelf previews
  - Shelf Detail: Netflix-style grid of book covers
  - Book Detail: Full book info with notes
  - Scan: Camera-based barcode scanner
  - Book Preview: Modal for adding scanned books
  - Create Shelf: Modal for creating new shelves
  - Profile: Settings and stats

### Data Flow
- Barcode scanning via expo-camera
- Book data from Google Books API (free, no key required)
- In-memory state management via custom store

### Key Technologies
- React Navigation 7
- expo-camera for barcode scanning
- Google Books API for book metadata
- expo-haptics for tactile feedback
- Reanimated for smooth animations

## Project Structure

```
client/
├── assets/images/     # Generated illustrations and avatars
├── components/        # Reusable UI components
├── constants/         # Theme and design tokens
├── hooks/             # Custom React hooks
├── navigation/        # React Navigation setup
├── screens/           # App screens
└── store/             # In-memory state management

server/
├── index.ts           # Express server entry
└── routes.ts          # API routes
```

## Design System

### Colors
- **Primary:** Warm Brown (#8B4513) - evokes wood bookcases
- **Secondary:** Cream (#F5F5DC) - like aged book pages
- **Accent:** Deep Teal (#2C5F5F) - for interactive elements

### Features
- 2:3 aspect ratio book covers
- Spring animations on interactions
- Haptic feedback on successful scans
- Camera permission handling with fallbacks

## Recent Changes

- December 7, 2025: Initial prototype created
  - Implemented all MVP screens
  - Set up barcode scanning with Google Books API
  - Created in-memory storage system
  - Generated app icon and illustrations

## User Preferences

- Mobile-first design
- No authentication required (single user)
- Warm, bookish color palette
