import { Platform, StyleSheet, View } from 'react-native';
import WebNavbar from './WebNavbar';

export default function WebLayout({ children, showNavbar = true }) {
  if (Platform.OS !== 'web') return children;

  return (
    <View style={styles.page}>
      {showNavbar ? <WebNavbar /> : null}
      <View style={[styles.content, showNavbar && styles.contentWithNavbar]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'transparent',
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentWithNavbar: {
    paddingTop: 64,
  },
});
