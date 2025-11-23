import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import FlyBirdGameWebHtml from './FlyBirdGameWebContent';

const GAME_SOURCE = { html: FlyBirdGameWebHtml };
const isWeb = Platform.OS === 'web';

export default function FlyBirdGame({ onBack }) {
  return (
    <View style={styles.container}>
      {isWeb ? (
        <View style={styles.webview}>
          <iframe
            title="Fly Bird Game"
            srcDoc={FlyBirdGameWebHtml}
            style={iframeStyle}
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          />
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={GAME_SOURCE}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowsInlineMediaPlayback
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
        />
      )}
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>{'<- Geri'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  webview: {
    flex: 1
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  }
});

const iframeStyle = {
  border: '0',
  width: '100%',
  height: '100%',
  flex: 1
};
