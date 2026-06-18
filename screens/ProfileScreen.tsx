import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37',
  primaryFixed: '#ffe088',
  primaryFixedDim: '#e9c349',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  outlineVariant: '#4d4635',
};

import { ScreenName } from '../App';

export default function ProfileScreen({ onNavigate }: { onNavigate?: (screen: ScreenName) => void }) {
  const [publicLedger, setPublicLedger] = useState(true);
  const [ritualNotifs, setRitualNotifs] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MAQRA</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconTextActive}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Eminence Level Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7dlgLaj3QGNTI_poZ4yciSGfzquwVXs1_24IlKyP2qd4I-k1E4wmWXoPBZ9wUbXspEZ5QTwakAeaE1n74F2L9jBE1LetF3qLuuorG_NhqqobQjyJCiQSsx0LUYaUNcC1oMkH9e76ErS7FkyEbPKIyKLj5ncH3VJO5eVVdJg39xK7qTzwMLr7Ggng03W4RG9_XkHugN12cpTUDgKuBvtLjfTv4xhxvxtE-fKsVM0Hmf0FZhQwyC1op08S3mkXrnXB4ZZlZl5xjWRgZ' }} 
              style={styles.avatarImage} 
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LEVEL 42</Text>
            </View>
          </View>
          <Text style={styles.eminenceTitle}>Eminence Level</Text>
          <Text style={styles.eminenceSubtitle}>Grand Scholar of the First Order</Text>
        </View>

        {/* Core Attributes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎖️</Text>
            <Text style={styles.sectionTitle}>CORE ATTRIBUTES</Text>
          </View>
          <View style={styles.attributesGrid}>
            <AttributeCard icon="🔥" label="ZEAL" value="87" />
            <AttributeCard icon="👁️" label="INSIGHT" value="92" />
            <AttributeCard icon="⏳" label="PATIENCE" value="64" />
            <AttributeCard icon="⚖️" label="AUTHORITY" value="78" />
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>WISDOM TIME</Text>
              <Text style={styles.statValue}>4,280 h</Text>
              <Text style={styles.statDesc}>Hours spent in deep contemplation and study of the ancient texts.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>PAGES CONSUMED</Text>
              <Text style={styles.statValue}>12,405</Text>
              <Text style={styles.statDesc}>Leaves of knowledge absorbed into the grand repository of mind.</Text>
            </View>
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
              thumbColor={COLORS.surfaceVariant || '#353534'}
            />
          </View>

          <TouchableOpacity style={styles.sealButton}>
            <Text style={styles.sealButtonText}>SEAL CHANGES</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav Placeholder */}
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
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarImage: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
  },
  levelText: {
    color: COLORS.primaryFixedDim, // #e9c349 in palette mapping to 'primary' in their HTML
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  eminenceTitle: {
    fontSize: 24,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'MedievalSharp_400Regular',
  },
  eminenceSubtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 8,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: 8,
  },
  attributeIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  attributeLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 8,
  },
  attributeValue: {
    fontSize: 32,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  statCard: {
    backgroundColor: COLORS.surfaceContainer,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    color: COLORS.primaryFixedDim,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Cinzel_700Bold',
  },
  statDesc: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  vaultSection: {
    backgroundColor: COLORS.surfaceContainerHigh,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  sealButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  sealButtonText: {
    color: '#554300', // on-primary-container
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
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
