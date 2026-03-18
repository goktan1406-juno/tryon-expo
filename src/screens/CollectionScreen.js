import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, FlatList, ScrollView, StatusBar, Alert, Dimensions, Modal, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCollection } from '../hooks/useCollection';
import { colors, fonts, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - spacing.lg * 2 - spacing.sm) / 2;

function formatDate(iso) {
  const d = new Date(iso);
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function CollectionScreen({ navigation }) {
  const { items, removeItem } = useCollection();
  const [preview, setPreview] = useState(null);

  const handleLongPress = (item) => {
    Alert.alert('Remove', 'Remove this item from your collection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  };

  const handleShare = async (imageUrl) => {
    try {
      await Share.share({ message: 'Check out my AI virtual try-on! 👗', url: imageUrl });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COLLECTION</Text>
        <Text style={styles.headerCount}>{items.length} items</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🧥</Text>
          <Text style={styles.emptyTitle}>No saves yet</Text>
          <Text style={styles.emptyDesc}>
            Save your virtual try-on results here to view them later.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Upload')}
            activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>CREATE A TRY-ON</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setPreview(item)}
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.9}>
              <Image source={{ uri: item.resultImage }} style={styles.itemImg} resizeMode="cover" />
              <View style={styles.itemFooter}>
                <Text style={styles.itemDate}>{formatDate(item.savedAt)}</Text>
                <TouchableOpacity onPress={() => handleShare(item.resultImage)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.itemShare}>↑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Full-screen preview modal */}
      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreview(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {preview && (
            <>
              <ScrollView
                maximumZoomScale={4}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                centerContent
                style={styles.modalImgWrap}>
                <Image source={{ uri: preview.resultImage }} style={styles.modalImg} resizeMode="contain" />
              </ScrollView>
              <Text style={styles.modalDate}>{formatDate(preview.savedAt)}</Text>
              <TouchableOpacity
                style={styles.modalShareBtn}
                onPress={() => handleShare(preview.resultImage)}
                activeOpacity={0.85}>
                <Text style={styles.modalShareText}>SHARE</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.sand,
  },
  backBtn: { ...fonts.bodyMedium, fontSize: 14, color: colors.copper },
  headerTitle: { ...fonts.label, fontSize: 10, color: colors.ash },
  headerCount: { ...fonts.bodyLight, fontSize: 12, color: colors.ashLight },

  grid: { padding: spacing.lg, paddingBottom: spacing.xl },
  row: { gap: spacing.sm },

  item: {
    width: ITEM_SIZE,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  itemImg: { width: '100%', height: ITEM_SIZE * 1.3 },
  itemFooter: { padding: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemDate: { ...fonts.bodyLight, fontSize: 10, color: colors.ash },
  itemShare: { fontSize: 16, color: colors.copper, fontWeight: '600' },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...fonts.displayLight, fontSize: 24, color: colors.ink },
  emptyDesc: { ...fonts.bodyLight, fontSize: 13, color: colors.ash, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    borderWidth: 1, borderColor: colors.ink,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  emptyBtnText: { ...fonts.label, fontSize: 10, color: colors.ink, letterSpacing: 3 },

  modal: {
    flex: 1, backgroundColor: `${colors.ink}F0`,
    alignItems: 'center', justifyContent: 'center', gap: spacing.md,
  },
  modalClose: {
    position: 'absolute', top: 56, right: spacing.lg,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: colors.cream, fontSize: 20 },
  modalImgWrap: { width: width, height: width * 1.4 },
  modalImg: { width: width, height: width * 1.4 },
  modalDate: { ...fonts.bodyLight, fontSize: 12, color: `${colors.cream}80` },
  modalShareBtn: {
    borderWidth: 1, borderColor: colors.cream,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2,
  },
  modalShareText: { ...fonts.label, fontSize: 11, color: colors.cream, letterSpacing: 3 },
});
