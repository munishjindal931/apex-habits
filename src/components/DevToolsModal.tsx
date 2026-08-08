import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { getSimulatedDateOffset, todayKey } from '../habitUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function DevToolsModal({ visible, onClose }: Props) {
  const {
    activeChallenges,
    advanceSimulatedDate,
    resetSimulatedDate,
    triggerCelebration,
    fastCompleteActiveChallenge,
    seedMockHistory,
  } = useAppData();

  const currentOffset = getSimulatedDateOffset();
  const today = todayKey();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="bug" size={22} color="#FF9500" />
            <Text style={styles.title}>Developer Test Tools</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Time Travel Section */}
          <Text style={styles.sectionHeader}>⏳ Time Travel Simulation</Text>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Current Simulated Today:</Text>
            <Text style={styles.dateDisplay}>{today} ({currentOffset === 0 ? 'Real Today' : `+${currentOffset} day(s)`})</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.btn} onPress={() => advanceSimulatedDate(1)}>
                <Text style={styles.btnText}>+1 Day ⏩</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={() => advanceSimulatedDate(3)}>
                <Text style={styles.btnText}>+3 Days ⏩⏩</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.resetBtn]} onPress={resetSimulatedDate}>
                <Text style={[styles.btnText, styles.resetBtnText]}>Reset Date 🔄</Text>
              </Pressable>
            </View>
          </View>

          {/* Reward & Celebration Section */}
          <Text style={styles.sectionHeader}>🎉 Celebration & Reward Testing</Text>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Instantly test audio, haptics & celebration overlay:</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.btn} onPress={() => triggerCelebration('habit')}>
                <Text style={styles.btnText}>Habit Done 🎉</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.goldBtn]} onPress={() => triggerCelebration('challenge')}>
                <Text style={styles.goldBtnText}>Challenge Win 🏆</Text>
              </Pressable>
            </View>
          </View>

          {/* Active Challenge Fast-Forward */}
          <Text style={styles.sectionHeader}>⚡ Kickstart Challenge Fast-Forward</Text>
          <View style={styles.card}>
            {activeChallenges.length === 0 ? (
              <Text style={styles.emptyText}>No active challenges running right now. Start a challenge on any habit to test auto-complete.</Text>
            ) : (
              activeChallenges.map(({ challenge, progress }) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeName}>{challenge.habitName}</Text>
                    <Text style={styles.challengeDetails}>
                      {challenge.lengthDays}-Day Kickstart (Day {progress.daysCompleted + 1} of {challenge.lengthDays})
                    </Text>
                  </View>
                  <Pressable
                    style={styles.fastCompleteBtn}
                    onPress={() => fastCompleteActiveChallenge(challenge.id)}
                  >
                    <Text style={styles.fastCompleteBtnText}>Complete & Reward 🔥</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* Data Seeding Section */}
          <Text style={styles.sectionHeader}>📊 Mock Data & Seed Tools</Text>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Populate 14 days of history to test streak & progress charts:</Text>
            <Pressable style={styles.seedBtn} onPress={seedMockHistory}>
              <Text style={styles.seedBtnText}>Seed 14-Day Completion History 🚀</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#26262E',
    backgroundColor: '#16161A',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: '#16161A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  dateDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resetBtn: {
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  resetBtnText: {
    color: '#F4F4F5',
  },
  goldBtn: {
    backgroundColor: '#F59E0B',
  },
  goldBtnText: {
    color: '#0B0B0E',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  challengeCard: {
    flexDirection: 'column',
    gap: 10,
  },
  challengeInfo: {
    marginBottom: 4,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  challengeDetails: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  fastCompleteBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  fastCompleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  seedBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  seedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
