import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useBookStore } from './store/useBookStore';
import LibraryScreen from './screens/LibraryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReadingSessionScreen from './screens/ReadingSessionScreen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useFonts, MedievalSharp_400Regular } from '@expo-google-fonts/medievalsharp';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export type ScreenName = 'Library' | 'Scripture' | 'Scrolls' | 'Temple';

export default function App() {
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);
  const profile = useBookStore((s) => s.profile);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Library');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    MedievalSharp_400Regular,
  });

  // Restore persistent RTL setting at launch
  useEffect(() => {
    if (profile && profile.rtlEnabled !== undefined) {
      const { setRTL } = require('./lib/rtl');
      setRTL(profile.rtlEnabled);
    }
  }, []);

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
        coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/muqaddimah_cover_1781865740916.png',
      });
      addBook({
        title: 'The Ring of the Dove',
        author: 'Ibn Hazm',
        totalPages: 280,
        status: 'completed',
        currentPage: 280,
        genre: 'Literature',
        language: 'en',
        coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/ring_dove_cover_1781865753421.png',
      });
      addBook({
        title: 'Les Misérables',
        author: 'Victor Hugo',
        totalPages: 450,
        status: 'want_to_read',
        currentPage: 0,
        genre: 'Novel',
        language: 'en',
        coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/les_miserables_cover_1781865765782.png',
      });
      addBook({
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        totalPages: 110,
        status: 'paused',
        currentPage: 45,
        genre: 'Story',
        language: 'en',
        coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/little_prince_cover_1781865789990.png',
      });
    } else {
      // Seed covers for existing books if they do not have them
      books.forEach((b) => {
        if (!b.coverUri) {
          const store = useBookStore.getState();
          if (b.title === 'The Muqaddimah') {
            store.updateBook(b.id, { coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/muqaddimah_cover_1781865740916.png' });
          } else if (b.title === 'The Ring of the Dove') {
            store.updateBook(b.id, { coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/ring_dove_cover_1781865753421.png' });
          } else if (b.title === 'Les Misérables') {
            store.updateBook(b.id, { coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/les_miserables_cover_1781865765782.png' });
          } else if (b.title === 'The Little Prince') {
            store.updateBook(b.id, { coverUri: 'file:///C:/Users/user/.gemini/antigravity-ide/brain/c5b02f90-18b5-4e4c-8f1d-9edc2e402d8e/little_prince_cover_1781865789990.png' });
          }
        }
      });
    }
  }, [books]);

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
    <SafeAreaProvider>
      <ThemeProvider>
        {renderScreen()}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

