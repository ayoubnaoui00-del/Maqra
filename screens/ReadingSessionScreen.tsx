import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const COLORS = {
  background: '#131313',
  primaryContainer: '#d4af37',
  primaryFixed: '#ffe088',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#d0c5af',
  onPrimaryFixed: '#241a00',
  outlineVariant: '#4d4635',
};

import { ScreenName } from '../App';

export default function ReadingSessionScreen({ onEndSession, onNavigate }: { onEndSession?: () => void, onNavigate?: (screen: ScreenName) => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Actions */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={onEndSession}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.statusChip}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>READING</Text>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Central Timer Section */}
        <View style={styles.centerSection}>
          <View style={styles.contextMeta}>
            <Text style={styles.metaLabel}>CURRENT TEXT</Text>
            <Text style={styles.metaTitle}>Scroll of Isaiah</Text>
            <View style={styles.divider} />
          </View>

          {/* Timer Monolith Placeholder */}
          <View style={styles.timerMonolith}>
            <View style={styles.timerInnerRing}>
              <View style={styles.timerTextContainer}>
                <Text style={styles.timeReadout}>45:22</Text>
                <Text style={styles.timeLabel}>REMAINING</Text>
              </View>
            </View>
          </View>

          {/* Primary Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>🔖</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playPauseButton}>
              <Text style={styles.playPauseIcon}>⏸</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>Tap gold seal to pause</Text>
        </View>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Library')}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate?.('Scripture')}>
          <Text style={styles.navIconActive}>📖</Text>
          <Text style={styles.navTextActive}>Scripture</Text>
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
    backgroundColor: '#6b0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4a0000',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryFixed,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.primaryFixed,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  contextMeta: {
    alignItems: 'center',
    marginBottom: 40,
  },
  metaLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.7,
    marginBottom: 8,
  },
  metaTitle: {
    fontSize: 32,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    fontFamily: 'MedievalSharp_400Regular',
  },
  divider: {
    height: 1,
    width: 60,
    backgroundColor: COLORS.primaryContainer,
    opacity: 0.5,
    marginTop: 12,
  },
  timerMonolith: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  timerInnerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timeReadout: {
    fontSize: 48,
    color: COLORS.primaryFixed,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'Cinzel_700Bold',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 3,
    marginTop: 8,
    opacity: 0.6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlIcon: {
    fontSize: 24,
    color: COLORS.onSurfaceVariant,
  },
  playPauseButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryFixed,
    borderBottomWidth: 2,
    borderBottomColor: '#735c00',
  },
  playPauseIcon: {
    fontSize: 40,
    color: COLORS.onPrimaryFixed,
  },
  helpText: {
    marginTop: 32,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.5,
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
