// src/components/HealthAccess/BuyPlanModal.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';

const BuyPlanModal = ({ visible, onDismiss, plan, onConfirm }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {plan ? (
          <>
            <Text style={styles.title}>Buy {plan.name}</Text>
            <Text style={styles.price}>₹ {plan.price}</Text>
            {plan.description ? (
              <Text style={styles.desc}>{plan.description}</Text>
            ) : null}

            <View style={styles.actions}>
              <Button mode="outlined" onPress={onDismiss}>
                Cancel
              </Button>
              <Button mode="contained" onPress={() => onConfirm(plan)}>
                Confirm Purchase
              </Button>
            </View>
          </>
        ) : (
          <Text style={styles.title}>No plan selected</Text>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    color: '#0d6efd',
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default BuyPlanModal;
