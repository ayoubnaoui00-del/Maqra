import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Switch, 
  Alert,
  TextInput,
  Platform
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing as ReanimatedEasing, FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
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

export default function ProfileScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
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
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Library')}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Library</Text>
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
          <Text style={styles.navIconActive}>🏛️</Text>
          <Text style={styles.navTextActive}>Temple</Text>
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
  },
  statValue: {
    fontSize: 28,
    color: COLORS.primaryFixedDim,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Cinzel_700Bold',
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
});
