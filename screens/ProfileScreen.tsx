import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch, 
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing as ReanimatedEasing, FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useBookStore } from '../store/useBookStore';
import { ScreenName } from '../App';
import { formatDate } from '../lib/date';
import { setRTL } from '../lib/rtl';

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37', // Gold
  primaryFixed: '#ffe088',
  primaryFixedDim: '#e9c349',
  secondary: '#ffe088',
  tertiary: '#d0c5af',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  outlineVariant: '#4d4635',
};

export default function ProfileScreen({ currentScreen = 'Temple', onNavigate }: { currentScreen?: ScreenName; onNavigate?: (screen: ScreenName) => void }) {
  const profile = useBookStore((s) => s.profile);
  const updateProfile = useBookStore((s) => s.updateProfile);
  const sessions = useBookStore((s) => s.sessions);
  const books = useBookStore((s) => s.books);

  const [publicLedger, setPublicLedger] = useState(true);
  const [ritualNotifs, setRitualNotifs] = useState(false);
  const [rtlEnabled, setRtlEnabled] = useState(profile.rtlEnabled || false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name || 'Grand Scholar');
  const [yearlyGoalInput, setYearlyGoalInput] = useState(profile.yearlyGoal.toString());

  // Compute Stats
  const completedBooksCount = books.filter(b => b.status === 'completed').length;
  
  // Total Pages read from session history
  const totalPagesConsumed = sessions.reduce((acc, s) => acc + s.pagesRead, 0);

  // Total time spent reading (seconds)
  const totalReadingSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalReadingHours = (totalReadingSeconds / 3600).toFixed(1);

  // Calculate Streak
  const currentStreak = useBookStore((s) => s.getCurrentStreak());

  // Dynamic Gamified Attributes
  // ZEAL: based on streak
  const zeal = Math.min(99, Math.max(10, currentStreak * 15 + 10));
  // INSIGHT: based on pages deciphered
  const insight = Math.min(99, Math.max(10, Math.round((totalPagesConsumed / 100) * 8 + 15)));
  // PATIENCE: average session duration in minutes (target 30m = max patience)
  const totalSessions = sessions.length;
  const avgSessionMin = totalSessions > 0 ? (totalReadingSeconds / totalSessions) / 60 : 0;
  const patience = Math.min(99, Math.max(10, Math.round((avgSessionMin / 30) * 60 + 20)));
  // AUTHORITY: based on completed books
  const authority = Math.min(99, Math.max(10, completedBooksCount * 15 + 25));

  // Compute monthly data for chart (last 6 months)
  const getMonthlyStats = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const yearMonthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Count completed books in this month
      const count = books.filter(b => {
        if (!b.completedAt || b.status !== 'completed') return false;
        return b.completedAt.startsWith(yearMonthKey);
      }).length;
      
      months.push({ label, count });
    }
    return months;
  };

  const monthlyData = getMonthlyStats();



  const handlePickAvatar = async () => {
    Alert.alert(
      'Update Avatar',
      'Select a source for your scholar portrait:',
      [
        {
          text: 'Take Portrait (Camera)',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera access is required to take portraits.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0].uri) {
              updateProfile({ avatarUri: result.assets[0].uri });
            }
          }
        },
        {
          text: 'Select Portrait (Library)',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Media library access is required to select portraits.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0].uri) {
              updateProfile({ avatarUri: result.assets[0].uri });
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const saveProfileDetails = () => {
    const goalNum = parseInt(yearlyGoalInput, 10);
    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid yearly goal.');
      return;
    }
    updateProfile({
      name: nameInput,
      yearlyGoal: goalNum,
    });
    setIsEditingName(false);
    Alert.alert('Profile Sealed', 'Your profile details have been sealed.');
  };

  const handleToggleRTL = (value: boolean) => {
    setRtlEnabled(value);
    updateProfile({ rtlEnabled: value });
    setRTL(value);
    Alert.alert(
      'Layout Mirroring',
      'The layout mirroring setting has been updated. Please reload the application to apply the shift fully.',
      [{ text: 'Acknowledged' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MAQRA</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate?.('Temple')}>
          <Text style={styles.iconTextActive}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Eminence Level Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7dlgLaj3QGNTI_poZ4yciSGfzquwVXs1_24IlKyP2qd4I-k1E4wmWXoPBZ9wUbXspEZ5QTwakAeaE1n74F2L9jBE1LetF3qLuuorG_NhqqobQjyJCiQSsx0LUYaUNcC1oMkH9e76ErS7FkyEbPKIyKLj5ncH3VJO5eVVdJg39xK7qTzwMLr7Ggng03W4RG9_XkHugN12cpTUDgKuBvtLjfTv4xhxvxtE-fKsVM0Hmf0FZhQwyC1op08S3mkXrnXB4ZZlZl5xjWRgZ' }} 
                style={styles.avatarImage} 
              />
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>GOAL: {profile.yearlyGoal}</Text>
            </View>
          </TouchableOpacity>
          
          {isEditingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameTextInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Scholar Name"
                placeholderTextColor={COLORS.onSurfaceVariant}
              />
              <TextInput
                style={styles.goalTextInput}
                value={yearlyGoalInput}
                onChangeText={setYearlyGoalInput}
                keyboardType="numeric"
                placeholder="Goal"
                placeholderTextColor={COLORS.onSurfaceVariant}
              />
              <TouchableOpacity style={styles.saveProfileButton} onPress={saveProfileDetails}>
                <Text style={styles.saveProfileButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameDisplayRow}>
              <Text style={styles.eminenceTitle}>{profile.name || 'Grand Scholar'}</Text>
              <Text style={styles.editPen}>✏️</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.eminenceSubtitle}>Grand Scholar of the First Order</Text>
        </View>

        {/* Core Attributes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎖️</Text>
            <Text style={styles.sectionTitle}>CORE ATTRIBUTES</Text>
          </View>
          <View style={styles.attributesGrid}>
            <AttributeCard icon="🔥" label="ZEAL" value={zeal.toString()} />
            <AttributeCard icon="👁️" label="INSIGHT" value={insight.toString()} />
            <AttributeCard icon="⏳" label="PATIENCE" value={patience.toString()} />
            <AttributeCard icon="⚖️" label="AUTHORITY" value={authority.toString()} />
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>WISDOM TIME</Text>
              <Text style={styles.statValue}>{totalReadingHours} h</Text>
              <Text style={styles.statDesc}>Hours spent in deep contemplation and study of the ancient texts.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>PAGES CONSUMED</Text>
              <Text style={styles.statValue}>{totalPagesConsumed}</Text>
              <Text style={styles.statDesc}>Leaves of knowledge absorbed into the grand repository of mind.</Text>
            </View>
          </View>
        </View>

        {/* Custom Monthly Activity Chart */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionTitle}>MONTHLY DECIPHERMENT</Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
              {monthlyData.map((data, index) => (
                <ChartBar key={index} label={data.label} count={data.count} />
              ))}
            </View>
          </View>
        </View>

        {/* Study History Session List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📜</Text>
            <Text style={styles.sectionTitle}>STUDY CHRONICLES</Text>
          </View>
          
          <View style={styles.historyList}>
            {sessions.length > 0 ? (
              sessions.slice(0, 5).map((session, index) => {
                const book = books.find(b => b.id === session.bookId);
                const sessionDate = formatDate(new Date(session.startTime));
                return (
                  <Animated.View 
                    key={session.id || index} 
                    entering={FadeInDown.delay(index * 100).duration(450)}
                    style={styles.historyItem}
                  >
                    <View style={styles.historyItemIcon}>
                      <Text style={styles.historyBookIcon}>📖</Text>
                    </View>
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyTitle}>{book?.title || 'Unknown Text'}</Text>
                      <Text style={styles.historyMeta}>
                        Read {session.pagesRead} pages in {Math.round(session.durationSeconds / 60)}m
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{sessionDate}</Text>
                  </Animated.View>
                );
              })
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No study chronicles recorded yet.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Imperial Vault Settings */}
        <View style={styles.vaultSection}>
          <View style={styles.vaultHeader}>
            <Text style={styles.sectionIcon}>🏛️</Text>
            <Text style={styles.sectionTitle}>IMPERIAL VAULT</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Public Ledger</Text>
              <Text style={styles.settingDesc}>Allow other scholars to view your attributes.</Text>
            </View>
            <Switch 
              value={publicLedger} 
              onValueChange={setPublicLedger} 
              trackColor={{ false: COLORS.surfaceContainerHighest, true: COLORS.primaryFixedDim }}
              thumbColor={COLORS.primaryContainer}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ritual Notifications</Text>
              <Text style={styles.settingDesc}>Receive summons for daily study sessions.</Text>
            </View>
            <Switch 
              value={ritualNotifs} 
              onValueChange={setRitualNotifs} 
              trackColor={{ false: COLORS.surfaceContainerHighest, true: COLORS.primaryFixedDim }}
              thumbColor={COLORS.outlineVariant || '#353534'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Arabic RTL Layout</Text>
              <Text style={styles.settingDesc}>Mirror layout structure for right-to-left scripts.</Text>
            </View>
            <Switch 
              value={rtlEnabled} 
              onValueChange={handleToggleRTL} 
              trackColor={{ false: COLORS.surfaceContainerHighest, true: COLORS.primaryFixedDim }}
              thumbColor={COLORS.primaryContainer}
            />
          </View>
        </View>
      </ScrollView>

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

function AttributeCard({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <View style={styles.attributeCard}>
      <Text style={styles.attributeIcon}>{icon}</Text>
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={styles.attributeValue}>{value}</Text>
    </View>
  );
}

function ChartBar({ label, count }: { label: string; count: number }) {
  const heightProgress = useSharedValue(0);

  useEffect(() => {
    // Scale heights: max is 5 books = 100% height (100px)
    const targetHeight = Math.min(100, count * 20);
    heightProgress.value = withTiming(targetHeight, {
      duration: 800,
      easing: ReanimatedEasing.bezier(0.4, 0, 0.2, 1),
    });
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightProgress.value,
    };
  });

  return (
    <View style={styles.chartBarColumn}>
      <Text style={styles.chartBarValue}>{count}</Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={styles.chartBarLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.onSurfaceVariant,
  },
  iconTextActive: {
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2.5,
    borderColor: COLORS.primaryContainer,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
  },
  levelText: {
    color: COLORS.primaryFixedDim,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eminenceTitle: {
    fontSize: 24,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'MedievalSharp_400Regular',
  },
  editPen: {
    fontSize: 14,
    opacity: 0.7,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    width: '90%',
    justifyContent: 'center',
  },
  nameTextInput: {
    backgroundColor: COLORS.surfaceContainer,
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    flex: 2,
  },
  goalTextInput: {
    backgroundColor: COLORS.surfaceContainer,
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    width: 50,
    textAlign: 'center',
  },
  saveProfileButton: {
    backgroundColor: COLORS.primaryContainer,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveProfileButtonText: {
    color: '#241a00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eminenceSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.primaryFixedDim,
    letterSpacing: 2,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attributeCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
  },
  attributeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  attributeLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'MedievalSharp_400Regular',
  },
  attributeValue: {
    fontSize: 26,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainer,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'MedievalSharp_400Regular',
  },
  statValue: {
    fontSize: 28,
    color: COLORS.primaryFixedDim,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'MedievalSharp_400Regular',
  },
  statDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 15,
  },
  chartContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'flex-end',
    height: 140,
  },
  chartBarColumn: {
    alignItems: 'center',
    width: 40,
  },
  chartBarValue: {
    color: COLORS.primaryFixed,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  barTrack: {
    height: 100,
    width: 14,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: COLORS.primaryContainer,
    width: '100%',
    borderRadius: 7,
  },
  chartBarLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    marginTop: 6,
  },
  historyList: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 8,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  historyItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyBookIcon: {
    fontSize: 16,
  },
  historyItemContent: {
    flex: 1,
  },
  historyTitle: {
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  historyMeta: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  historyDate: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  emptyHistory: {
    padding: 24,
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontStyle: 'italic',
  },
  vaultSection: {
    backgroundColor: COLORS.surfaceContainerHigh,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: 12,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'MedievalSharp_400Regular',
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
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
