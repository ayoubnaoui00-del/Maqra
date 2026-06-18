import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useBookStore } from './store/useBookStore';
import LibraryScreen from './screens/LibraryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReadingSessionScreen from './screens/ReadingSessionScreen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useFonts, MedievalSharp_400Regular } from '@expo-google-fonts/medievalsharp';

export type ScreenName = 'Library' | 'Scripture' | 'Scrolls' | 'Temple';

export default function App() {
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Library');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    MedievalSharp_400Regular,
  });

  // Seed initial sample books for demonstration if empty
  useEffect(() => {
    if (books.length === 0) {
      addBook({
        title: 'The Muqaddimah',
        author: 'Ibn Khaldun',
        totalPages: 600,
        status: 'reading',
        currentPage: 150,
        genre: 'History',
        language: 'en',
      });
      addBook({
        title: 'The Ring of the Dove',
        author: 'Ibn Hazm',
        totalPages: 280,
        status: 'completed',
        currentPage: 280,
        genre: 'Literature',
        language: 'en',
      });
      addBook({
        title: 'Les Misérables',
        author: 'Victor Hugo',
        totalPages: 450,
        status: 'want_to_read',
        currentPage: 0,
        genre: 'Novel',
        language: 'en',
      });
      addBook({
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        totalPages: 110,
        status: 'paused',
        currentPage: 45,
        genre: 'Story',
        language: 'en',
      });
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleStartSession = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentScreen('Scripture');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Library':
        return (
          <LibraryScreen 
            onNavigate={setCurrentScreen} 
            onStartSession={handleStartSession} 
          />
        );
      case 'Scripture':
        return (
          <ReadingSessionScreen 
            bookId={selectedBookId} 
            onEndSession={() => {
              setSelectedBookId(null);
              setCurrentScreen('Library');
            }} 
            onNavigate={setCurrentScreen} 
          />
        );
      case 'Temple':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      case 'Scrolls':
      default:
        return (
          <LibraryScreen 
            onNavigate={setCurrentScreen} 
            onStartSession={handleStartSession} 
          />
        );
    }
  };

  return (
    <ThemeProvider>
      {renderScreen()}
    </ThemeProvider>
  );
}

