import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen = () => {
  console.log('TestScreen: Rendering...');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen - Navigation Working!</Text>
      <Text style={styles.subtext}>If you see this, navigation is working</Text>
      <Text style={styles.debug}>Check console for logs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  debug: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});

export default TestScreen;
