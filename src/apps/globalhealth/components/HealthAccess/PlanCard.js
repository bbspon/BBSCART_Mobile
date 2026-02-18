import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BuyPlanModal from './BuyPlanModal';

const PlanCard = ({ plan }) => {
  const navigation = useNavigation();
  const [showBuyModal, setShowBuyModal] = useState(false);

  return (
    <>
      <View style={styles.card}>
        {/* Plan Title */}
        <Text style={styles.title}>{plan.name}</Text>

        {/* Description */}
        {plan.description ? (
          <Text style={styles.desc}>{plan.description}</Text>
        ) : null}

        {/* Price */}
        <Text style={styles.price}>₹ {plan.price} / year</Text>

        {/* Primary Buttons */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.compareBtn}
            onPress={() =>
              navigation.navigate('PlanComparisonEditor', {
                planId: plan._id,
              })
            }
          >
            <Text style={styles.compareText}>Compare</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => setShowBuyModal(true)}
          >
            <Text style={styles.buyText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Buttons */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation.navigate('PlanDetails', {
                planId: plan._id,
              })
            }
          >
            <Text style={styles.secondaryText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation.navigate('PlanTerms', {
                planId: plan._id,
              })
            }
          >
            <Text style={styles.secondaryText}>Plan Terms</Text>
          </TouchableOpacity>
        </View>

        {/* Coverage Status */}
        <TouchableOpacity
          style={styles.coverageBtn}
          onPress={() =>
            navigation.navigate('CoverageStatus', {
              planId: plan._id,
              planName: plan.name,
            })
          }
        >
          <Text style={styles.coverageText}>Coverage Status</Text>
        </TouchableOpacity>

        {/* Family Timeline Button (matching web version) */}
        <TouchableOpacity
          style={styles.familyTimelineBtn}
          onPress={() =>
            navigation.navigate('FamilyHealthTimeline', {
              planId: plan._id,
            })
          }
        >
          <Text style={styles.familyTimelineText}>Family Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 Buy Plan Modal */}
      <BuyPlanModal
        visible={showBuyModal}

        
        plan={plan}
        onDismiss={() => setShowBuyModal(false)}
        onConfirm={() => {
          setShowBuyModal(false);
          navigation.navigate('MyPlans');
        }}
      />

    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: '#0d6efd',
    fontWeight: '600',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  compareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0d6efd',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  compareText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#198754',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#0dcaf0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  coverageBtn: {
    marginTop: 6,
    backgroundColor: '#20c997',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  coverageText: {
    color: '#fff',
    fontWeight: '700',
  },
  familyTimelineBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#212529',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  familyTimelineText: {
    color: '#212529',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default PlanCard;
