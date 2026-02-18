import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
  Linking,
  StyleSheet,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock API data
const fetchPlans = () =>
  Promise.resolve([
    { insurer: "Daman", plan: "Enhanced", price: 120, currency: "AED", benefits: "Maternity, chronic", region: "UAE" },
    { insurer: "Sukoon", plan: "HealthPlus", price: 95, currency: "AED", benefits: "Wide network", region: "UAE" },
    { insurer: "AXA Gulf", plan: "Prime", price: 140, currency: "AED", benefits: "Corporate friendly", region: "UAE" },
  ]);

const fetchUserPolicy = () =>
  Promise.resolve({
    insurer: "Sukoon",
    plan: "HealthPlus",
    expiry: "2026-02-15",
    sumInsured: "AED 200,000",
    claimStatus: "Pending",
    claimAmount: "AED 8,500",
    claimDate: "2025-07-01",
    pdfFile: "sukoon-healthplus.pdf",
    autoRenew: true,
    corporate: { name: "ABC Corp", plan: true },
  });

export default function UAEInsuranceIntegration() {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [selected, setSelected] = useState(null);
  const [consent, setConsent] = useState(false);
  const [modalInfo, setModalInfo] = useState({ show: false, type: "buy" });
  const [lang, setLang] = useState("en");

  useEffect(() => {
    fetchPlans().then(setPlans);
    fetchUserPolicy().then(setPolicy);
  }, []);

  const handleBuy = (plan) => {
    if (!consent) {
      alert(lang === "en" ? "Please consent first." : "يرجى الموافقة أولاً.");
      return;
    }
    setSelected(plan);
    setModalInfo({ show: true, type: "buy" });
  };

  const openPDF = (file) => {
    // Replace with your PDF viewer logic or external link
    Linking.openURL(`https://example.com/policies/${file}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {lang === "en" ? "🏥 UAE Hospital Cover Add-On" : "🏥 إضافة تغطية المستشفى"}
        </Text>
        <View style={styles.langSwitch}>
          <TouchableOpacity onPress={() => setLang("en")} style={styles.langButton}>
            <Text>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLang("ar")} style={styles.langButton}>
            <Text>عربي</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Alert */}
      <View style={styles.alert}>
        <Text>
          {lang === "en"
            ? "BBSCART Care Pass covers outpatient only. Add regulated insurer for hospitalization."
            : "يغطي باقة BBSCART العيادات الخارجية فقط. أضف تأمينًا معتمدًا للمستشفى."}
        </Text>
      </View>

      {/* Current Policy */}
      {policy && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{lang === "en" ? "Your Current Policy" : "بوليصتك الحالية"}</Text>
          <View style={styles.row}><Text style={styles.cell}>{lang === "en" ? "Insurer" : "شركة التأمين"}</Text><Text style={styles.cell}>{policy.insurer}</Text></View>
          <View style={styles.row}><Text style={styles.cell}>{lang === "en" ? "Plan" : "الخطة"}</Text><Text style={styles.cell}>{policy.plan}</Text></View>
          <View style={styles.row}><Text style={styles.cell}>{lang === "en" ? "Expiry" : "تاريخ الانتهاء"}</Text><Text style={styles.cell}>{policy.expiry}</Text></View>
          <View style={styles.row}><Text style={styles.cell}>{lang === "en" ? "Sum Insured" : "المبلغ المؤمن"}</Text><Text style={styles.cell}>{policy.sumInsured}</Text></View>
          <View style={styles.row}>
            <Text style={styles.cell}>{lang === "en" ? "Claim Status" : "حالة المطالبة"}</Text>
            <Text style={styles.cell}>
              {policy.claimStatus} - {policy.claimAmount} ({policy.claimDate})
            </Text>
          </View>
          <TouchableOpacity onPress={() => openPDF(policy.pdfFile)} style={styles.pdfButton}>
            <Text>📥 {lang === "en" ? "Download" : "تحميل"}</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text>{lang === "en" ? "Auto-Renew" : "تجديد تلقائي"}</Text>
            <Switch value={policy.autoRenew} onValueChange={() => setPolicy(p => ({ ...p, autoRenew: !p.autoRenew }))} />
          </View>

          {policy.corporate.plan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{lang === "en" ? "Covered by Employer" : "تغطية من جهة العمل"}</Text>
            </View>
          )}
        </View>
      )}

      {/* Plans */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{lang === "en" ? "Compare & Add Insurance" : "قارن وأضف التأمين"}</Text>
        <FlatList
          data={plans}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{item.insurer} — {item.plan}</Text>
              <Text>{item.benefits}</Text>
              <Text style={styles.planPrice}><Text style={{ fontWeight: 'bold' }}>{item.price} {item.currency}/mo</Text></Text>
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
                <Text style={{ color: "#fff" }}>{lang === "en" ? "Buy Now" : "اشتري الآن"}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <View style={styles.consentRow}>
          <Switch value={consent} onValueChange={setConsent} />
          <Text style={{ marginLeft: 8 }}>
            {lang === "en"
              ? "I consent to share my data with insurer."
              : "أوافق على مشاركة بياناتي مع شركة التأمين."}
          </Text>
        </View>
      </View>

      {/* Insurance Coach Button */}
      <TouchableOpacity style={styles.coachButton} onPress={() => setModalInfo({ show: true, type: "help" })}>
        <Text>💬 {lang === "en" ? "Ask Insurance Coach" : "استشر المرشد"}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalInfo.show} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalInfo.type === "help"
                ? (lang === "en" ? "Insurance Coach" : "مرشد التأمين")
                : (lang === "en" ? `Buy ${selected?.insurer}` : `شراء ${selected?.insurer}`)}
            </Text>

            {modalInfo.type === "help" ? (
              <>
                <Text style={styles.modalQ}>{lang === "en" ? "Q: Why add this?" : "س: لماذا تضيف هذا؟"}</Text>
                <Text>{lang === "en" ? "Because Care Pass excludes hospital care, so you need additional insurance." : "لأن باقة العناية لا تشمل تكاليف المستشفى، لذا تحتاج إلى تأمين إضافي."}</Text>
                <Text style={styles.modalQ}>{lang === "en" ? "Q: Who handles claims?" : "س: من يتولى المطالبات؟"}</Text>
                <Text>{lang === "en" ? "The insurer is fully responsible for claim processing." : "شركة التأمين مسؤولة تمامًا عن معالجة المطالبات."}</Text>
              </>
            ) : (
              <>
                <Text>{lang === "en" ? `You will be redirected to ${selected?.insurer} for policy purchase.` : `سيتم توجيهك إلى ${selected?.insurer} لشراء البوليصة.`}</Text>
                <TouchableOpacity
                  style={[styles.buyButton, { marginTop: 16 }]}
                  onPress={() => setModalInfo({ ...modalInfo, show: false })}
                >
                  <Text style={{ color: "#fff" }}>{lang === "en" ? "Proceed" : "متابعة"}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setModalInfo({ ...modalInfo, show: false })}>
              <Text style={{ color: "red", textAlign: "center" }}>{lang === "en" ? "Close" : "إغلاق"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold" },
  langSwitch: { flexDirection: "row" },
  langButton: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#ddd", marginLeft: 4, borderRadius: 4 },
  alert: { backgroundColor: "#cce5ff", padding: 10, borderRadius: 4, marginBottom: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  cell: { fontSize: 14 },
  pdfButton: { marginVertical: 8 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  badge: { backgroundColor: "#007bff", padding: 4, borderRadius: 4, marginTop: 6, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontSize: 12 },
  planCard: { backgroundColor: "#fff", padding: 12, marginRight: 12, borderRadius: 8, width: 200 },
  planTitle: { fontWeight: "bold", marginBottom: 4 },
  planPrice: { marginVertical: 4 },
  buyButton: { backgroundColor: "#007bff", padding: 8, borderRadius: 4, alignItems: "center" },
  consentRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  coachButton: { backgroundColor: "#eee", padding: 10, borderRadius: 6, alignItems: "center", marginBottom: 12 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000aa" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 8, width: "90%" },
  modalTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  modalQ: { fontWeight: "bold", marginTop: 8 },
});
