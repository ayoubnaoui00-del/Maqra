import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Modal, 
  TextInput,
  Dimensions,
  Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBookStore } from '../store/useBookStore';
import { ScreenName } from '../App';
import { Book, ReadingStatus } from '../types';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37', // imperial gold
  primaryFixed: '#ffe088',
  primaryFixedDim: '#e9c349',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  outlineVariant: '#4d4635',
  danger: '#8f1d1d',
};

interface LibraryScreenProps {
  onNavigate?: (screen: ScreenName) => void;
  onStartSession?: (bookId: string) => void;
}

export default function LibraryScreen({ onNavigate, onStartSession }: LibraryScreenProps) {
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);
  const deleteBook = useBookStore((s) => s.deleteBook);
  const setBookStatus = useBookStore((s) => s.setBookStatus);
  const updateReadingProgress = useBookStore((s) => s.updateReadingProgress);
  const rateBook = useBookStore((s) => s.rateBook);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [progressInput, setProgressInput] = useState('');

  // Summon Modal State
  const [showSummonModal, setShowSummonModal] = useState(false);
  const [summonTitle, setSummonTitle] = useState('');
  const [summonAuthor, setSummonAuthor] = useState('');
  const [summonPages, setSummonPages] = useState('');
  const [summonGenre, setSummonGenre] = useState('');
  const [summonLanguage, setSummonLanguage] = useState('en');

  // Find the featured book (currently reading)
  const featuredBook = books.find(b => b.status === 'reading') || books[0];

  // Filter books list for Recent Acquisitions grid
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const openBookDetails = (book: Book) => {
    setSelectedBook(book);
    setProgressInput(book.currentPage.toString());
  };

  const handleUpdateProgress = () => {
    if (!selectedBook) return;
    const pageNum = parseInt(progressInput, 10);
    if (isNaN(pageNum) || pageNum < 0 || pageNum > selectedBook.totalPages) {
      Alert.alert('Invalid Page', `Please enter a page between 0 and ${selectedBook.totalPages}.`);
      return;
    }
    updateReadingProgress(selectedBook.id, pageNum);
    
    // Refresh modal state
    const updated = useBookStore.getState().books.find(b => b.id === selectedBook.id);
    if (updated) {
      setSelectedBook(updated);
    }
    Alert.alert('Success', 'Reading progress updated.');
  };

  const handleStatusChange = (status: ReadingStatus) => {
    if (!selectedBook) return;
    setBookStatus(selectedBook.id, status);
    const updated = useBookStore.getState().books.find(b => b.id === selectedBook.id);
    if (updated) {
      setSelectedBook(updated);
    }
  };

  const handleRateBook = (rating: number) => {
    if (!selectedBook) return;
    rateBook(selectedBook.id, rating);
    const updated = useBookStore.getState().books.find(b => b.id === selectedBook.id);
    if (updated) {
      setSelectedBook(updated);
    }
  };

  const handleSummonScroll = () => {
    if (!summonTitle.trim() || !summonAuthor.trim() || !summonPages.trim()) {
      Alert.alert('Invalid Scroll', 'Title, Author, and Page Count must be provided.');
      return;
    }
    const pagesVal = parseInt(summonPages, 10);
    if (isNaN(pagesVal) || pagesVal <= 0) {
      Alert.alert('Invalid Page Count', 'Please enter a valid page count.');
      return;
    }
    
    addBook({
      title: summonTitle.trim(),
      author: summonAuthor.trim(),
      totalPages: pagesVal,
      genre: summonGenre.trim() || 'General',
      language: summonLanguage,
    });

    // Reset & close
    setSummonTitle('');
    setSummonAuthor('');
    setSummonPages('');
    setSummonGenre('');
    setSummonLanguage('en');
    setShowSummonModal(false);

    Alert.alert('Scroll Summoned', 'A new manuscript has been added to your library.');
  };

  const handleDeleteBook = () => {
    if (!selectedBook) return;
    Alert.alert(
      'Remove Text',
      `Are you sure you want to remove "${selectedBook.title}" from the archives?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            deleteBook(selectedBook.id);
            setSelectedBook(null);
          }
        }
      ]
    );
  };

  // Compute stats
  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.status === 'completed').length;
  const completionPercentage = totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MAQRA</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate?.('Temple')}>
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.pageTitle}>Library</Text>
              <Text style={styles.pageSubtitle}>ANCIENT ARCHIVES</Text>
            </View>
            <TouchableOpacity style={styles.summonButton} onPress={() => setShowSummonModal(true)}>
              <Text style={styles.summonButtonText}>+ SUMMON</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Search Archives */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search archives by title or author..."
            placeholderTextColor={COLORS.onSurfaceVariant}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Imperial Status */}
        <View style={styles.statusWidget}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Imperial Status</Text>
            <Text style={styles.fireIcon}>🔥</Text>
          </View>
          
          <View style={styles.progressRow}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Knowledge Deciphered</Text>
              <Text style={styles.progressValue}>{completionPercentage}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔖 {completedBooks} / {totalBooks} Completed</Text>
            </View>
          </View>
        </View>

        {/* Currently Reading Featured Section */}
        {featuredBook && (
          <View style={styles.featuredSection}>
            {featuredBook.coverUri ? (
              <Image source={{ uri: featuredBook.coverUri }} style={styles.featuredImage} />
            ) : (
              <View style={[styles.featuredImage, styles.featuredImagePlaceholder]}>
                <Text style={styles.placeholderLetter}>{featuredBook.title[0]}</Text>
              </View>
            )}
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>CURRENTLY READING</Text>
              <Text style={[styles.featuredTitle, { textAlign: featuredBook.language === 'ar' ? 'right' : 'left' }]}>{featuredBook.title}</Text>
              <Text style={[styles.featuredAuthor, { textAlign: featuredBook.language === 'ar' ? 'right' : 'left' }]}>by {featuredBook.author}</Text>
              <Text style={styles.featuredDesc}>
                Current progress: {featuredBook.currentPage} / {featuredBook.totalPages} pages ({Math.round((featuredBook.currentPage / featuredBook.totalPages) * 100)}%)
              </Text>
              <View style={styles.featuredButtons}>
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={() => onStartSession?.(featuredBook.id)}
                >
                  <Text style={styles.primaryButtonText}>📖 Continue Reading</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => openBookDetails(featuredBook)}
                >
                  <Text style={styles.secondaryButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Recent Acquisitions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderStyle}>
            <Text style={styles.sectionTitle}>Recent Acquisitions</Text>
          </View>

          <View style={styles.grid}>
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, index) => {
                const progressPct = Math.round((book.currentPage / book.totalPages) * 100);
                return (
                  <Animated.View 
                    key={book.id}
                    entering={FadeInDown.delay(index * 50).duration(400)}
                    style={{ width: '48%', marginBottom: 16 }}
                  >
                    <TouchableOpacity 
                      style={[styles.gridItem, { width: '100%', marginBottom: 0 }]}
                      onPress={() => openBookDetails(book)}
                    >
                      {book.coverUri ? (
                        <Image source={{ uri: book.coverUri }} style={styles.gridImage} />
                      ) : (
                        <View style={styles.gridImagePlaceholder}>
                          <Text style={styles.gridItemLetter}>{book.title[0]}</Text>
                        </View>
                      )}
                      <Text style={[styles.gridItemTitle, { textAlign: book.language === 'ar' ? 'right' : 'left' }]} numberOfLines={1}>{book.title}</Text>
                      <Text style={[styles.gridItemSub, { textAlign: book.language === 'ar' ? 'right' : 'left' }]} numberOfLines={1}>{book.author}</Text>
                      <View style={styles.gridProgressRow}>
                        <View style={styles.gridProgressBarBg}>
                          <View style={[styles.gridProgressBarFill, { width: `${progressPct}%` }]} />
                        </View>
                        <Text style={styles.gridProgressText}>{progressPct}%</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📭</Text>
                <Text style={styles.emptyStateTitle}>No Scrolls Found</Text>
                <Text style={styles.emptyStateText}>
                  {books.length === 0 
                    ? "The archives are currently bare. Summon a new scroll to begin." 
                    : "No manuscripts match your search query in these archives."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Book Detail Modal */}
      {selectedBook && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedBook}
          onRequestClose={() => setSelectedBook(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Text Details</Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                
                {/* Book Meta Card */}
                <View style={styles.modalBookCard}>
                  {selectedBook.coverUri ? (
                    <Image source={{ uri: selectedBook.coverUri }} style={styles.modalCover} />
                  ) : (
                    <View style={styles.modalCoverPlaceholder}>
                      <Text style={styles.modalCoverLetter}>{selectedBook.title[0]}</Text>
                    </View>
                  )}
                  <View style={styles.modalBookDetails}>
                    <Text style={[styles.modalTitle, { textAlign: selectedBook.language === 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{selectedBook.title}</Text>
                    <Text style={[styles.modalAuthor, { textAlign: selectedBook.language === 'ar' ? 'right' : 'left' }]}>by {selectedBook.author}</Text>
                    <Text style={styles.modalMetaInfo}>Language: {selectedBook.language?.toUpperCase() || 'EN'}</Text>
                    <Text style={styles.modalMetaInfo}>Total Leaves: {selectedBook.totalPages} pages</Text>
                  </View>
                </View>

                {/* Stars Rating Selector */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>EMPEROR RATING</Text>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => handleRateBook(star)}>
                        <Text style={[
                          styles.starIcon, 
                          star <= (selectedBook.rating || 0) ? styles.starIconActive : styles.starIconInactive
                        ]}>
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Reading Status Selector */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>ARCHIVAL STATUS</Text>
                  <View style={styles.statusButtonGroup}>
                    {(['want_to_read', 'reading', 'paused', 'completed'] as ReadingStatus[]).map((status) => (
                      <TouchableOpacity 
                        key={status} 
                        style={[
                          styles.statusSelectButton,
                          selectedBook.status === status && styles.statusSelectButtonActive
                        ]}
                        onPress={() => handleStatusChange(status)}
                      >
                        <Text style={[
                          styles.statusSelectButtonText,
                          selectedBook.status === status && styles.statusSelectButtonActiveText
                        ]}>
                          {status.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Progress Input Form */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>DECIPHERED PROGRESS</Text>
                  <View style={styles.progressEditRow}>
                    <TextInput
                      style={styles.progressTextInput}
                      keyboardType="numeric"
                      value={progressInput}
                      onChangeText={setProgressInput}
                      placeholder="Page"
                      placeholderTextColor={COLORS.onSurfaceVariant}
                    />
                    <Text style={styles.progressSlash}>/</Text>
                    <Text style={styles.progressTotalText}>{selectedBook.totalPages} pages</Text>
                    
                    <TouchableOpacity style={styles.applyProgressButton} onPress={handleUpdateProgress}>
                      <Text style={styles.applyProgressButtonText}>SEAL</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick actions */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity 
                    style={styles.modalStartSessionButton}
                    onPress={() => {
                      setSelectedBook(null);
                      onStartSession?.(selectedBook.id);
                    }}
                  >
                    <Text style={styles.modalStartSessionText}>📖 COMMENCE STUDY</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalDeleteButton}
                    onPress={handleDeleteBook}
                  >
                    <Text style={styles.modalDeleteText}>🗑️ DISCARD</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Summon Scroll Modal */}
      {showSummonModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSummonModal}
          onRequestClose={() => setShowSummonModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Summon Scroll</Text>
                <TouchableOpacity onPress={() => setShowSummonModal(false)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>SCROLL TITLE</Text>
                  <TextInput
                    style={styles.progressTextInputFull}
                    placeholder="Enter manuscript title..."
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    value={summonTitle}
                    onChangeText={setSummonTitle}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>AUTHOR / SCRIBE</Text>
                  <TextInput
                    style={styles.progressTextInputFull}
                    placeholder="Enter scribe or author..."
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    value={summonAuthor}
                    onChangeText={setSummonAuthor}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>TOTAL LEAVES (PAGES)</Text>
                  <TextInput
                    style={styles.progressTextInputFull}
                    placeholder="e.g. 300"
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    keyboardType="numeric"
                    value={summonPages}
                    onChangeText={setSummonPages}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>GENRE / DISCIPLINE</Text>
                  <TextInput
                    style={styles.progressTextInputFull}
                    placeholder="e.g. Philosophy, History..."
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    value={summonGenre}
                    onChangeText={setSummonGenre}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>LANGUAGE</Text>
                  <View style={styles.statusButtonGroup}>
                    {['en', 'ar', 'fr'].map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.statusSelectButton,
                          summonLanguage === lang && styles.statusSelectButtonActive
                        ]}
                        onPress={() => setSummonLanguage(lang)}
                      >
                        <Text style={[
                          styles.statusSelectButtonText,
                          summonLanguage === lang && styles.statusSelectButtonActiveText
                        ]}>
                          {lang.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalStartSessionButton}
                    onPress={handleSummonScroll}
                  >
                    <Text style={styles.modalStartSessionText}>✨ SEAL SCROLL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Library')}>
          <Text style={styles.navIconActive}>📚</Text>
          <Text style={styles.navTextActive}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Scripture')}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navText}>Scripture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Scrolls')}>
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navText}>Scrolls</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Temple')}>
          <Text style={styles.navIcon}>🏛️</Text>
          <Text style={styles.navText}>Temple</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryContainer,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.primaryFixed,
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'MedievalSharp_400Regular',
  },
  titleSection: {
    padding: 24,
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primaryContainer,
    marginBottom: 8,
    fontFamily: 'MedievalSharp_400Regular',
  },
  pageSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.primaryContainer,
    opacity: 0.5,
    marginTop: 16,
    width: '100%',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    color: COLORS.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    fontSize: 14,
  },
  statusWidget: {
    backgroundColor: COLORS.surfaceContainerLow,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  fireIcon: {
    fontSize: 20,
  },
  progressRow: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  progressValue: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryContainer,
  },
  badgeRow: {
    marginTop: 4,
  },
  badge: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.primaryFixed,
    fontSize: 12,
  },
  featuredSection: {
    backgroundColor: COLORS.surfaceContainer,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredImagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLetter: {
    fontSize: 72,
    color: 'rgba(212,175,55,0.2)',
    fontFamily: 'MedievalSharp_400Regular',
  },
  featuredContent: {
    padding: 20,
  },
  featuredLabel: {
    color: COLORS.primaryContainer,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 26,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'MedievalSharp_400Regular',
  },
  featuredAuthor: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  featuredDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  featuredButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#241a00',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  secondaryButtonText: {
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontSize: 13,
  },
  recentSection: {
    paddingHorizontal: 24,
  },
  recentHeaderStyle: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.1)',
  },
  gridImage: {
    aspectRatio: 0.75,
    borderRadius: 4,
    marginBottom: 8,
  },
  gridImagePlaceholder: {
    aspectRatio: 0.75,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  gridItemLetter: {
    fontSize: 40,
    color: 'rgba(212,175,55,0.25)',
    fontFamily: 'MedievalSharp_400Regular',
  },
  gridItemTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'MedievalSharp_400Regular',
  },
  gridItemSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 8,
  },
  gridProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  gridProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gridProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryContainer,
  },
  gridProgressText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primaryContainer,
  },
  modalHeaderTitle: {
    fontSize: 18,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    letterSpacing: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 18,
  },
  modalScroll: {
    padding: 20,
  },
  modalBookCard: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  modalCover: {
    width: 90,
    height: 120,
    borderRadius: 6,
  },
  modalCoverPlaceholder: {
    width: 90,
    height: 120,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  modalCoverLetter: {
    fontSize: 48,
    color: 'rgba(212,175,55,0.3)',
    fontFamily: 'MedievalSharp_400Regular',
  },
  modalBookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'MedievalSharp_400Regular',
  },
  modalAuthor: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  modalMetaInfo: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  modalSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.1)',
    paddingBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 11,
    color: COLORS.primaryContainer,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starIcon: {
    fontSize: 32,
  },
  starIconActive: {
    color: COLORS.primaryContainer,
  },
  starIconInactive: {
    color: COLORS.surfaceContainerHighest,
  },
  statusButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSelectButton: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  statusSelectButtonActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: COLORS.primaryContainer,
  },
  statusSelectButtonText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusSelectButtonActiveText: {
    color: COLORS.primaryFixed,
  },
  progressEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTextInput: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 4,
    width: 70,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: COLORS.onSurface,
    textAlign: 'center',
    fontSize: 14,
  },
  progressSlash: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
  },
  progressTotalText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    flex: 1,
  },
  applyProgressButton: {
    backgroundColor: COLORS.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  applyProgressButtonText: {
    color: COLORS.primaryFixed,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalActionsRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
    paddingBottom: 20,
  },
  modalStartSessionButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalStartSessionText: {
    color: '#241a00',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  modalDeleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#e57373',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.primaryContainer,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navItem: {
    alignItems: 'center',
  },
  navIconActive: {
    fontSize: 24,
    color: COLORS.primaryFixed,
  },
  navTextActive: {
    color: COLORS.primaryFixed,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  navText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.5,
  },
  summonButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  summonButtonText: {
    color: '#241a00',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  progressTextInputFull: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 4,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: COLORS.onSurface,
    fontSize: 14,
  },
  emptyStateContainer: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyStateTitle: {
    color: COLORS.primaryFixed,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
