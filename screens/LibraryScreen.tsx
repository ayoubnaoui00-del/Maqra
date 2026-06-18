import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37',
  primaryFixed: '#ffe088',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
};

import { ScreenName } from '../App';

export default function LibraryScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MAQRA</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Library</Text>
          <Text style={styles.pageSubtitle}>ANCIENT ARCHIVES</Text>
          <View style={styles.divider} />
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
              <Text style={styles.progressValue}>73%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '73%' }]} />
            </View>
          </View>
          
          <View style={styles.progressRow}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Ritual Completion</Text>
              <Text style={styles.progressValue}>45%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '45%' }]} />
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔖 Scholar</Text>
            </View>
          </View>
        </View>

        {/* Currently Reading */}
        <View style={styles.featuredSection}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgDdbqL8xvzNfzY3-gMJjUTnmIgDt91OQR-RkO5XL0-B4ZjFpmwwATnVUpD5dLmLcKN0wpmBhRr5jJYzQDfT5aDmdQ6CtTYS1WZsd8nL4u7pi8ctIGyqcyJ-251oc3z-jgllaJLT4WazEisVtZfd2s58txSfcgcNEI-MXZrkFIc326u_-n3JDx4XoHIUumHlQbfu-j5Unb1kcYVJER8jmphBJofMfM4F3iRFBM72vGIEUaT2cL30n-JMgEpnZGVI6HTkKEPNg5mfyl' }} 
            style={styles.featuredImage} 
          />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredLabel}>CURRENTLY READING</Text>
            <Text style={styles.featuredTitle}>The Codex of Antioch</Text>
            <Text style={styles.featuredDesc}>
              Transcribed from the original stele, this volume details the foundational rites of the early empire.
            </Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>📖 Continue Reading</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Acquisitions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Acquisitions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {[
              { title: 'Decrees of Sol', vol: 'Volume I' },
              { title: 'Rituals of Ash', vol: 'Volume IV' },
              { title: 'Letters to the Senate', vol: 'Unabridged' },
              { title: 'Forbidden Texts', vol: 'Sealed' }
            ].map((book, idx) => (
              <View key={idx} style={styles.gridItem}>
                <View style={styles.gridImagePlaceholder}>
                  <Text style={styles.gridItemNumber}>{(idx + 1).toString()}</Text>
                </View>
                <Text style={styles.gridItemTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.gridItemSub}>{book.vol}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

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
    paddingBottom: 100,
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
    color: COLORS.primaryContainer, // Gold text
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
  statusWidget: {
    backgroundColor: COLORS.surfaceContainerLow,
    margin: 24,
    marginTop: 0,
    padding: 24,
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
    fontSize: 24,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  fireIcon: {
    fontSize: 24,
  },
  progressRow: {
    marginBottom: 16,
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
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryContainer,
  },
  badgeRow: {
    marginTop: 8,
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
    margin: 24,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 24,
  },
  featuredLabel: {
    color: COLORS.primaryContainer,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 28,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'MedievalSharp_400Regular',
  },
  featuredDesc: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.surfaceContainerHighest,
    padding: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  recentSection: {
    padding: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  viewAllText: {
    color: COLORS.primaryContainer,
    fontSize: 12,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  gridImagePlaceholder: {
    aspectRatio: 0.75,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 4,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemNumber: {
    fontSize: 32,
    color: 'rgba(212,175,55,0.4)',
  },
  gridItemTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Cinzel_700Bold',
  },
  gridItemSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
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
