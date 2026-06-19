import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps, 
  withTiming, 
  withRepeat, 
  withSequence, 
  Easing as ReanimatedEasing 
} from 'react-native-reanimated';
import { useBookStore } from '../store/useBookStore';
import { ScreenName } from '../App';

const ReanimatedCircle = Reanimated.createAnimatedComponent(Circle);

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37', // Gold
  primaryFixed: '#ffe088',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  onPrimaryFixed: '#241a00',
  outlineVariant: '#4d4635',
  danger: '#8f1d1d',
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ReadingSessionScreen({ 
  currentScreen = 'Scripture',
  bookId, 
  onEndSession, 
  onNavigate 
}: { 
  currentScreen?: ScreenName;
  bookId: string | null;
  onEndSession?: () => void;
  onNavigate?: (screen: ScreenName) => void;
}) {
  const books = useBookStore((s) => s.books);
  const startStoreSession = useBookStore((s) => s.startSession);
  const endStoreSession = useBookStore((s) => s.endSession);
  const cancelStoreSession = useBookStore((s) => s.cancelSession);

  // Fallback to first book if none is selected
  const activeBook = books.find(b => b.id === bookId) || books[0];

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Modals
  const [showEndModal, setShowEndModal] = useState(false);
  const [endPageInput, setEndPageInput] = useState('');

  // Timer reference
  const intervalRef = useRef<any>(null);

  // SVG Progress Ring Calculations
  const radius = 110;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  // Reanimated values
  const progressShared = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  // Initialize or update progress animation
  const bookProgress = activeBook ? (activeBook.currentPage / activeBook.totalPages) : 0;

  useEffect(() => {
    progressShared.value = withTiming(bookProgress, {
      duration: 1000,
      easing: ReanimatedEasing.bezier(0.4, 0, 0.2, 1),
    });
  }, [bookProgress]);

  useEffect(() => {
    if (!isTimerRunning) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1000, easing: ReanimatedEasing.ease }),
          withTiming(1, { duration: 1000, easing: ReanimatedEasing.ease })
        ),
        -1,
        true
      );
    } else {
      pulseValue.value = withTiming(1, { duration: 300 });
    }
  }, [isTimerRunning]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressShared.value);
    return {
      strokeDashoffset,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerHaptic = (type: 'start' | 'pause' | 'stop') => {
    try {
      if (type === 'start') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'pause') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === 'stop') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  };

  const handleStartPause = () => {
    if (!activeBook) {
      Alert.alert('No book selected', 'Please select a book from the Library to read.');
      return;
    }

    if (isTimerRunning) {
      // Pause
      triggerHaptic('pause');
      setIsTimerRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Start/Resume
      triggerHaptic('start');
      setIsTimerRunning(true);

      // If session not created yet, start one in the store
      if (!sessionId) {
        const id = startStoreSession(activeBook.id, activeBook.currentPage);
        setSessionId(id);
      }

      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopSession = () => {
    if (!sessionId) return;
    triggerHaptic('stop');
    
    // Pause timer
    setIsTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set end page default input to current page
    setEndPageInput(activeBook.currentPage.toString());
    setShowEndModal(true);
  };

  const handleCancelSession = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this study session? Progress will not be saved.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            if (sessionId) {
              cancelStoreSession(sessionId);
            }
            // Reset state and exit
            setIsTimerRunning(false);
            setElapsedSeconds(0);
            setSessionId(null);
            onEndSession?.();
          }
        }
      ]
    );
  };

  const handleSealSession = () => {
    if (!sessionId || !activeBook) return;
    const finalPage = parseInt(endPageInput, 10);

    if (isNaN(finalPage) || finalPage < activeBook.currentPage || finalPage > activeBook.totalPages) {
      Alert.alert(
        'Invalid Page', 
        `Please enter a page between ${activeBook.currentPage} and ${activeBook.totalPages}.`
      );
      return;
    }

    // Save session in store
    endStoreSession(sessionId, finalPage);
    
    // Reset state & exit
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setSessionId(null);
    setShowEndModal(false);
    
    Alert.alert('Session Saved', 'Your reading session has been sealed in the archives.');
    onEndSession?.();
  };

  // Format elapsed time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Header Actions */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCancelSession}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          
          <View style={[styles.statusChip, isTimerRunning && styles.statusChipActive]}>
            <View style={[styles.statusDot, isTimerRunning && styles.statusDotActive]} />
            <Text style={styles.statusText}>{isTimerRunning ? 'READING' : 'PAUSED'}</Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={handleCancelSession}>
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Central Timer Section */}
        {activeBook ? (
          <View style={styles.centerSection}>
            <View style={styles.contextMeta}>
              <Text style={styles.metaLabel}>CURRENT SCRIPTURE</Text>
              <Text style={[styles.metaTitle, { textAlign: activeBook.language === 'ar' ? 'right' : 'left' }]} numberOfLines={1}>{activeBook.title}</Text>
              <Text style={[styles.metaAuthor, { textAlign: activeBook.language === 'ar' ? 'right' : 'left' }]}>by {activeBook.author}</Text>
              <View style={styles.divider} />
            </View>

            {/* Timer Monolith & Progress Ring */}
            <View style={styles.timerMonolith}>
              <Svg width={250} height={250} style={styles.svgContainer}>
                {/* Background Ring */}
                <Circle
                  cx={125}
                  cy={125}
                  r={radius}
                  stroke={COLORS.surfaceContainerHighest}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Foreground Progress Ring */}
                <ReanimatedCircle
                  cx={125}
                  cy={125}
                  r={radius}
                  stroke={COLORS.primaryContainer}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  animatedProps={animatedCircleProps}
                  strokeLinecap="round"
                  transform="rotate(-90 125 125)"
                />
              </Svg>

              <View style={styles.timerInnerRing}>
                <View style={styles.timerTextContainer}>
                  <Text style={styles.timeReadout}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={styles.timeLabel}>ELAPSED</Text>
                  <Text style={styles.progressSubtext}>
                    Page {activeBook.currentPage} / {activeBook.totalPages} ({Math.round(bookProgress * 100)}%)
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Controls */}
            <View style={styles.controlsRow}>
              {sessionId && (
                <TouchableOpacity style={styles.controlButton} onPress={handleCancelSession}>
                  <Text style={styles.controlIcon}>✕</Text>
                </TouchableOpacity>
              )}

              <Reanimated.View style={animatedButtonStyle}>
                <TouchableOpacity style={styles.playPauseButton} onPress={handleStartPause}>
                  <Text style={styles.playPauseIcon}>{isTimerRunning ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
              </Reanimated.View>

              {sessionId && (
                <TouchableOpacity style={styles.controlButton} onPress={handleStopSession}>
                  <Text style={styles.controlIcon}>✓</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.helpText}>
              {isTimerRunning ? 'TAP GOLD SEAL TO PAUSE' : 'TAP GOLD SEAL TO COMMENCE'}
            </Text>
          </View>
        ) : (
          <View style={styles.centerSection}>
            <Text style={styles.metaTitle}>No Scroll Selected</Text>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => onNavigate?.('Library')}
            >
              <Text style={styles.primaryButtonText}>Return to Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* End Session Modal */}
      {showEndModal && activeBook && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showEndModal}
          onRequestClose={() => setShowEndModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Seal Contemplation</Text>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Your study of <Text style={styles.boldText}>"{activeBook.title}"</Text> lasted {Math.round(elapsedSeconds / 60)} minutes.
                </Text>
                
                <Text style={styles.inputLabel}>WHAT LEAF/PAGE DID YOU REACH?</Text>
                <View style={styles.pageInputRow}>
                  <TextInput
                    style={styles.pageTextInput}
                    keyboardType="numeric"
                    value={endPageInput}
                    onChangeText={setEndPageInput}
                    autoFocus={true}
                  />
                  <Text style={styles.pageTotalText}>/ {activeBook.totalPages} pages</Text>
                </View>
                
                <Text style={styles.modalDesc}>
                  Note: You started at page {activeBook.currentPage}.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.sealButton]}
                    onPress={handleSealSession}
                  >
                    <Text style={styles.sealButtonText}>SEAL PROGRESS</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowEndModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Resume Reading</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {/* Skeuomorphic Stone Background with Cracks & Chiseled details */}
        <Svg height="100%" width="100%" viewBox="0 0 400 64" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Dark Stone Gradient */}
            <LinearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2c2826" />
              <Stop offset="0.2" stopColor="#1e1b1a" />
              <Stop offset="0.8" stopColor="#131211" />
              <Stop offset="1" stopColor="#0a0a09" />
            </LinearGradient>
            {/* Bronze/Iron Bevel Gradient */}
            <LinearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#bfa37a" />
              <Stop offset="0.5" stopColor="#8c6239" />
              <Stop offset="1" stopColor="#543b22" />
            </LinearGradient>
          </Defs>
          
          {/* Base Stone Background */}
          <Rect x="0" y="0" width="400" height="64" fill="url(#stoneGrad)" />
          
          {/* Top Bevel / Forged Bronze Border */}
          <Rect x="0" y="0" width="400" height="4" fill="url(#bronzeGrad)" />
          
          {/* Ancient Stone Cracks */}
          <Path d="M 40,4 L 43,15 L 41,24 L 45,30 M 41,24 L 38,27" stroke="#0a0a09" strokeWidth="1.5" fill="none" opacity="0.8" />
          <Path d="M 41,4 L 44,15 L 42,24 L 46,30" stroke="#3d3936" strokeWidth="0.5" fill="none" opacity="0.4" />
          
          <Path d="M 180,4 L 176,12 L 179,22 M 176,12 L 172,16" stroke="#0a0a09" strokeWidth="1.5" fill="none" opacity="0.8" />
          <Path d="M 181,4 L 177,12 L 180,22" stroke="#3d3936" strokeWidth="0.5" fill="none" opacity="0.4" />

          <Path d="M 290,35 L 293,42 L 291,55 M 293,42 L 298,46" stroke="#0a0a09" strokeWidth="1.5" fill="none" opacity="0.8" />
          
          {/* Panel Dividers / Pillars */}
          <Path d="M 100,4 L 100,64" stroke="#2b2416" strokeWidth="2" opacity="0.75" />
          <Path d="M 101,4 L 101,64" stroke="#ffe088" strokeWidth="1" opacity="0.1" />
          
          <Path d="M 200,4 L 200,64" stroke="#2b2416" strokeWidth="2" opacity="0.75" />
          <Path d="M 201,4 L 201,64" stroke="#ffe088" strokeWidth="1" opacity="0.1" />
          
          <Path d="M 300,4 L 300,64" stroke="#2b2416" strokeWidth="2" opacity="0.75" />
          <Path d="M 301,4 L 301,64" stroke="#ffe088" strokeWidth="1" opacity="0.1" />
        </Svg>
        
        {/* Tab 1: Library */}
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'Library' && styles.navItemActive]} 
          onPress={() => onNavigate?.('Library')}
        >
          {currentScreen === 'Library' && <View style={styles.activeGlowUnderlay} />}
          
          {/* Gemstones in gold sockets */}
          <View style={[styles.gemstoneSocket, styles.gemTopLeft]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Library' ? '#e74c3c' : '#7b241c' }]} />
          </View>
          <View style={[styles.gemstoneSocket, styles.gemTopRight]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Library' ? '#e74c3c' : '#7b241c' }]} />
          </View>
          
          {/* Arcane Rune watermark */}
          <Text style={[styles.runeWatermark, currentScreen === 'Library' && styles.runeWatermarkActive]}>᚛</Text>
          
          <Text style={currentScreen === 'Library' ? styles.navIconActive : styles.navIcon}>📚</Text>
          <Text style={currentScreen === 'Library' ? styles.navTextActive : styles.navText}>Library</Text>
        </TouchableOpacity>

        {/* Tab 2: Scripture */}
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'Scripture' && styles.navItemActive]} 
          onPress={() => onNavigate?.('Scripture')}
        >
          {currentScreen === 'Scripture' && <View style={styles.activeGlowUnderlay} />}
          
          <View style={[styles.gemstoneSocket, styles.gemTopLeft]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Scripture' ? '#3498db' : '#1f618d' }]} />
          </View>
          <View style={[styles.gemstoneSocket, styles.gemTopRight]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Scripture' ? '#3498db' : '#1f618d' }]} />
          </View>
          
          <Text style={[styles.runeWatermark, currentScreen === 'Scripture' && styles.runeWatermarkActive]}>ᚠ</Text>
          
          <Text style={currentScreen === 'Scripture' ? styles.navIconActive : styles.navIcon}>📖</Text>
          <Text style={currentScreen === 'Scripture' ? styles.navTextActive : styles.navText}>Scripture</Text>
        </TouchableOpacity>

        {/* Tab 3: Scrolls */}
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'Scrolls' && styles.navItemActive]} 
          onPress={() => onNavigate?.('Scrolls')}
        >
          {currentScreen === 'Scrolls' && <View style={styles.activeGlowUnderlay} />}
          
          <View style={[styles.gemstoneSocket, styles.gemTopLeft]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Scrolls' ? '#2ecc71' : '#1e8449' }]} />
          </View>
          <View style={[styles.gemstoneSocket, styles.gemTopRight]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Scrolls' ? '#2ecc71' : '#1e8449' }]} />
          </View>
          
          <Text style={[styles.runeWatermark, currentScreen === 'Scrolls' && styles.runeWatermarkActive]}>ᚦ</Text>
          
          <Text style={currentScreen === 'Scrolls' ? styles.navIconActive : styles.navIcon}>📜</Text>
          <Text style={currentScreen === 'Scrolls' ? styles.navTextActive : styles.navText}>Scrolls</Text>
        </TouchableOpacity>

        {/* Tab 4: Temple */}
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'Temple' && styles.navItemActive]} 
          onPress={() => onNavigate?.('Temple')}
        >
          {currentScreen === 'Temple' && <View style={styles.activeGlowUnderlay} />}
          
          <View style={[styles.gemstoneSocket, styles.gemTopLeft]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Temple' ? '#f1c40f' : '#9a7d0a' }]} />
          </View>
          <View style={[styles.gemstoneSocket, styles.gemTopRight]}>
            <View style={[styles.gemstone, { backgroundColor: currentScreen === 'Temple' ? '#f1c40f' : '#9a7d0a' }]} />
          </View>
          
          <Text style={[styles.runeWatermark, currentScreen === 'Temple' && styles.runeWatermarkActive]}>ᛟ</Text>
          
          <Text style={currentScreen === 'Temple' ? styles.navIconActive : styles.navIcon}>🏛️</Text>
          <Text style={currentScreen === 'Temple' ? styles.navTextActive : styles.navText}>Temple</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.onSurfaceVariant,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a2d0c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
  },
  statusChipActive: {
    backgroundColor: '#1b3a1a',
    borderColor: '#4caf50',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryFixed,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#81c784',
  },
  statusText: {
    color: COLORS.primaryFixed,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'MedievalSharp_400Regular',
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  contextMeta: {
    alignItems: 'center',
    marginBottom: 24,
  },
  metaLabel: {
    color: COLORS.primaryContainer,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'MedievalSharp_400Regular',
  },
  metaTitle: {
    fontSize: 30,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  metaAuthor: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    height: 1,
    width: 80,
    backgroundColor: COLORS.primaryContainer,
    opacity: 0.5,
    marginTop: 12,
  },
  timerMonolith: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  svgContainer: {
    position: 'absolute',
  },
  timerInnerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  timeReadout: {
    fontSize: 44,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'MedievalSharp_400Regular',
  },
  timeLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 3,
    marginTop: 2,
    opacity: 0.7,
    fontFamily: 'MedievalSharp_400Regular',
  },
  progressSubtext: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'MedievalSharp_400Regular',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: COLORS.onSurfaceVariant,
    fontWeight: 'bold',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryFixed,
    borderBottomWidth: 3,
    borderBottomColor: '#8f761d',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playPauseIcon: {
    fontSize: 32,
    color: COLORS.onPrimaryFixed,
  },
  helpText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 2,
    opacity: 0.6,
    fontFamily: 'MedievalSharp_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primaryContainer,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 18,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    letterSpacing: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    color: COLORS.onSurface,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.primaryFixed,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.primaryContainer,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'MedievalSharp_400Regular',
  },
  pageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  pageTextInput: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 6,
    width: 90,
    height: 44,
    color: COLORS.onSurface,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pageTotalText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    fontFamily: 'MedievalSharp_400Regular',
  },
  modalDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'column',
    gap: 12,
  },
  modalButton: {
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealButton: {
    backgroundColor: COLORS.primaryContainer,
  },
  sealButtonText: {
    color: '#241a00',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontSize: 13,
    fontFamily: 'MedievalSharp_400Regular',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cancelButtonText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'MedievalSharp_400Regular',
  },
  primaryButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#241a00',
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#111010', // Deep dark weathered stone/iron background
    borderTopWidth: 4,
    borderTopColor: '#8c6239', // Heavy forged bronze top border
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 64, // Reduced from 80
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 25,
  },
  navTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ffe088', // Thin gold highlight line right under top border
    opacity: 0.4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#2b2416', // Dark iron borders between panels
    borderLeftWidth: 1,
    borderLeftColor: '#1a160d',
    backgroundColor: 'transparent', // Transparent to let the stone Svg background show through
    position: 'relative',
    height: '100%',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 150, 0, 0.02)', // Extremely subtle warm tint when active
  },
  activeGlowUnderlay: {
    position: 'absolute',
    width: 44, // Reduced from 50
    height: 44, // Reduced from 50
    borderRadius: 22,
    backgroundColor: 'rgba(255, 150, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.1)',
    shadowColor: '#ff9900',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'center',
    top: 6, // Adjusted from 10
  },
  gemstoneSocket: {
    position: 'absolute',
    top: 6, // Adjusted from 8
    width: 10, // Slightly smaller from 12
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: '#bfa37a', // Bronze rim
    backgroundColor: '#1b1915', // Forged metal socket background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 2,
  },
  gemTopLeft: {
    left: 6, // Adjusted from 8
  },
  gemTopRight: {
    right: 6, // Adjusted from 8
  },
  gemstone: {
    width: 5, // Slightly smaller from 6
    height: 5,
    borderRadius: 2.5,
  },
  runeWatermark: {
    position: 'absolute',
    fontSize: 16, // Slightly smaller from 20
    color: '#00ffff', // Glowing blue/cyan arcane runes
    opacity: 0.05,
    bottom: 16, // Adjusted from 22
    alignSelf: 'center',
    fontFamily: 'MedievalSharp_400Regular',
  },
  runeWatermarkActive: {
    opacity: 0.2,
    textShadowColor: '#00ffff',
    textShadowRadius: 6,
  },
  navIconActive: {
    fontSize: 22, // Reduced from 26
    color: '#ffe088', // Magical gold
    textShadowColor: '#ff9900', // Fiery orange/magical gold aura glow
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  navIcon: {
    fontSize: 18, // Reduced from 22
    color: '#3d3d3d', // Dark unlit stone/aged metal style
    opacity: 0.45,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  navTextActive: {
    color: '#ffe088', // Glowing gold
    fontSize: 9.5, // Slightly smaller from 11
    marginTop: 2, // Reduced from 4
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
    textShadowColor: '#ff9900',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 0 },
    letterSpacing: 0.5,
  },
  navText: {
    color: '#4d4635', // Dark unlit text
    fontSize: 9.5, // Slightly smaller from 11
    marginTop: 2, // Reduced from 4
    fontFamily: 'MedievalSharp_400Regular',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
});
