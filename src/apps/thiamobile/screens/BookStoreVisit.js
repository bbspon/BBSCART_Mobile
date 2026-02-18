// frontend/screens/BookStoreVisit.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * BookStoreVisit.js
 *
 * Feature-complete frontend for "Book a Store Visit" (Jewellery)
 * - Branch selection (mock)
 * - Date chips (next 14 days)
 * - Time-slot picker (morning/afternoon/evening)
 * - Purpose (multi-select)
 * - Consultant selection & VIP option
 * - Group booking support
 * - Home visit (VIP-only) toggle
 * - Confirmation modal with booking id & QR-token text
 * - Booking history + reschedule / cancel
 *
 * TODO / Integrations:
 * - Replace local mock with backend APIs for branches, consultants, availability, createBooking, cancelBooking
 * - Integrate Google Maps / Mapbox for branch pin & directions
 * - Integrate device calendar APIs to add events (expo-calendar / react-native-calendar-events)
 * - Integrate push/SMS reminders (FCM / backend SMS)
 * - Replace QR text with actual QR image (react-native-qrcode-svg)
 * - Securely send booking info to staff dashboard / CRM
 */

// ---------- Mock data (replace with API) ----------
const MOCK_BRANCHES = [
  { id: "b1", name: "Thiaworld - MG Road", address: "MG Road, City Center", lat: 0, lng: 0 },
  { id: "b2", name: "Thiaworld - City Mall", address: "City Mall, West Wing", lat: 0, lng: 0 },
  { id: "b3", name: "Thiaworld - Riverside", address: "Riverside Plaza", lat: 0, lng: 0 },
];

const MOCK_CONSULTANTS = [
  { id: "c1", name: "Asha - Bridal Specialist", specialties: ["bridal", "diamond"], vip: true },
  { id: "c2", name: "Ravi - Gold Expert", specialties: ["exchange", "gold"], vip: false },
  { id: "c3", name: "Meera - Silver & Fashion", specialties: ["silver", "fashion"], vip: false },
];

const VISIT_PURPOSES = [
  { id: "p1", key: "bridal", label: "Bridal Jewellery" },
  { id: "p2", key: "exchange", label: "Gold Exchange / Buyback" },
  { id: "p3", key: "custom", label: "Custom Design" },
  { id: "p4", key: "purchase", label: "Purchase - Gold/Silver" },
  { id: "p5", key: "repair", label: "Repair / Cleaning" },
  { id: "p6", key: "consult", label: "Consultation" },
];

// time slots groups
const SLOTS = {
  morning: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  afternoon: ["12:30 PM", "01:00 PM", "02:00 PM", "02:30 PM"],
  evening: ["04:30 PM", "05:00 PM", "06:00 PM", "06:30 PM"],
};

// ---------- Helpers ----------
const tomorrow = (d = new Date(), days = 0) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const dateLabel = (d) => {
  const today = new Date();
  const diff = Math.floor((d - new Date(today.setHours(0,0,0,0))) / (24*3600*1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const genBookingId = () => "TV" + Math.random().toString(36).slice(2, 9).toUpperCase();

// ---------- Screen ----------
export default function BookStoreVisit({ navigation }) {
  const insets = useSafeAreaInsets();
  // booking form state
  const [branch, setBranch] = useState(MOCK_BRANCHES[0]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(tomorrow(new Date(), 1));
  const [slotGroup, setSlotGroup] = useState("morning"); // morning/afternoon/evening
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [purposes, setPurposes] = useState([]); // keys
  const [consultant, setConsultant] = useState(null);
  const [isVip, setIsVip] = useState(false);
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [groupMembers, setGroupMembers] = useState([{ id: 1, name: "", phone: "" }]);
  const [specialRequest, setSpecialRequest] = useState("");
  const [homeVisit, setHomeVisit] = useState(false); // toggle disabled if not VIP
  const [reminder, setReminder] = useState(true); // receive reminders

  // UI modals
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [viewBookingModal, setViewBookingModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [consultantModalVisible, setConsultantModalVisible] = useState(false);

  // booking history (persist to backend in real app)
  const [bookings, setBookings] = useState([]);

  // availability map (mock): { "branchId|dateStr": { morning: [...], afternoon: [...], evening: [...] } }
  const [availability, setAvailability] = useState({});

  // on mount, generate next 14 dates and mock availability
  useEffect(() => {
    const next = [];
    for (let i = 0; i < 14; i++) next.push(tomorrow(new Date(), i));
    setDates(next);
    setSelectedDate(next[0]);

    // mock availability for each branch+date (randomly block some slots)
    const av = {};
    next.forEach((d) => {
      const dateKey = d.toISOString().split("T")[0];
      MOCK_BRANCHES.forEach((b) => {
        const key = `${b.id}|${dateKey}`;
        av[key] = {
          morning: SLOTS.morning.map((t) => ({ t, free: Math.random() > 0.12 })),
          afternoon: SLOTS.afternoon.map((t) => ({ t, free: Math.random() > 0.12 })),
          evening: SLOTS.evening.map((t) => ({ t, free: Math.random() > 0.12 })),
        };
      });
    });
    setAvailability(av);
  }, []);

  // derive available slots for current selection
  const availableSlots = useMemo(() => {
    const dateKey = selectedDate.toISOString().split("T")[0];
    const key = `${branch.id}|${dateKey}`;
    const av = availability[key];
    if (!av) return SLOTS[slotGroup].map((t) => ({ t, free: true }));
    return av[slotGroup] || [];
  }, [availability, branch, selectedDate, slotGroup]);

  // toggle purpose
  const togglePurpose = (key) => {
    setPurposes((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  // group members add/remove
  const addMember = () => setGroupMembers((s) => [...s, { id: Date.now(), name: "", phone: "" }]);
  const removeMember = (id) => setGroupMembers((s) => s.filter((m) => m.id !== id));

  // set consultant
  const onSelectConsultant = (c) => {
    setConsultant(c);
    setConsultantModalVisible(false);
    if (c && c.vip) setIsVip(true);
  };

  // reset form
  const resetForm = () => {
    setBranch(MOCK_BRANCHES[0]);
    setSelectedDate(dates[0] || tomorrow(new Date(), 1));
    setSlotGroup("morning");
    setSelectedSlot(null);
    setPurposes([]);
    setConsultant(null);
    setIsVip(false);
    setIsGroupBooking(false);
    setGroupMembers([{ id: 1, name: "", phone: "" }]);
    setSpecialRequest("");
    setHomeVisit(false);
  };

  // create booking (simulate API)
  const onConfirmBooking = () => {
    if (!selectedSlot) return Alert.alert("Select slot", "Please select a time slot.");
    if (purposes.length === 0) return Alert.alert("Select purpose", "Please select at least one purpose of visit.");

    // Basic validation for group members
    if (isGroupBooking) {
      const invalid = groupMembers.some((m) => !m.name || !m.phone);
      if (invalid) return Alert.alert("Group members", "Please fill name & phone for all group members.");
    }

    // Build booking
    const id = genBookingId();
    const booking = {
      id,
      branch,
      date: selectedDate.toISOString().split("T")[0],
      dateDisplay: selectedDate.toDateString(),
      slot: selectedSlot,
      slotGroup,
      purposes,
      consultant,
      isVip,
      group: isGroupBooking ? groupMembers : null,
      specialRequest,
      homeVisit: homeVisit && isVip, // only if VIP
      reminder,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
      qrToken: id + "|" + branch.id + "|" + Date.now(),
    };

    // update local bookings
    setBookings((prev) => [booking, ...prev]);

    // mark slot as booked in availability (simulate)
    const dateKey = booking.date;
    const key = `${branch.id}|${dateKey}`;
    setAvailability((prev) => {
      const copy = { ...prev };
      if (!copy[key]) copy[key] = { morning: [], afternoon: [], evening: [] };
      copy[key][slotGroup] = (copy[key][slotGroup] || []).map((s) => (s.t === booking.slot ? { ...s, free: false } : s));
      return copy;
    });

    setCurrentBooking(booking);
    setConfirmModalVisible(true);

    // TODO: POST booking to backend -> returns confirmed booking id + staff assignment + QR image
    // TODO: trigger push/SMS reminders, add calendar event, notify staff dashboard

    // Reset form optionally
    // resetForm();
  };

  // cancel booking
  const onCancelBooking = (b) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        onPress: () => {
          setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "Cancelled" } : x)));
          // TODO: call backend cancel
          Alert.alert("Cancelled", "Booking has been cancelled.");
        },
        style: "destructive",
      },
    ]);
  };

  // reschedule (simple: open form prefilled)
  const onReschedule = (b) => {
    setBranch(b.branch);
    setSelectedDate(new Date(b.date));
    setSlotGroup(b.slotGroup);
    setSelectedSlot(b.slot);
    setPurposes(b.purposes);
    setConsultant(b.consultant);
    setIsVip(b.isVip);
    setIsGroupBooking(!!b.group);
    setGroupMembers(b.group || [{ id: 1, name: "", phone: "" }]);
    setSpecialRequest(b.specialRequest || "");
    setHomeVisit(b.homeVisit || false);

    // remove old booking or mark updated (in production do backend update)
    setBookings((prev) => prev.filter((x) => x.id !== b.id));
    Alert.alert("Reschedule", "Make new selection and confirm to reschedule (simulation).");
  };

  // view booking details
  const onViewBooking = (b) => {
    setCurrentBooking(b);
    setViewBookingModal(true);
  };

  // add to calendar (simulated)
  const onAddToCalendar = (b) => {
    // TODO: Integrate native calendar APIs
    Alert.alert("Add to Calendar", `Booking ${b.id} would be added to device calendar (simulate).`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#faf8f5" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 + Math.max(12, insets.bottom) + 8 }}>
        <Text style={styles.title}>Book a Store Visit</Text>
        <Text style={styles.subtitle}>Schedule a personalized appointment at your nearest Thiaworld branch</Text>

        {/* Branch selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose Branch</Text>
          <TouchableOpacity style={styles.selectRow} onPress={() => setBranchModalVisible(true)}>
            <View>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.small}>{branch.address}</Text>
            </View>
            <Text style={styles.link}>Change</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Tip: We suggest the nearest branch based on your location (enable GPS).</Text>
        </View>

        {/* Date + Slots */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose Date & Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {dates.map((d) => {
              const isSelected = selectedDate.toDateString() === d.toDateString();
              return (
                <TouchableOpacity
                  key={d.toISOString()}
                  style={[styles.dateChip, isSelected && styles.dateChipActive]}
                  onPress={() => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                  }}
                >
                  <Text style={[styles.dateChipText, isSelected && { color: "#fff" }]}>{dateLabel(d)}</Text>
                  <Text style={[styles.small, isSelected && { color: "#fff" }]}>{d.toLocaleDateString()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* slot groups */}
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            {["morning", "afternoon", "evening"].map((g) => (
              <TouchableOpacity key={g} style={[styles.slotGroupBtn, slotGroup === g && styles.slotGroupBtnActive]} onPress={() => { setSlotGroup(g); setSelectedSlot(null); }}>
                <Text style={[styles.slotGroupText, slotGroup === g && { color: "#fff" }]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Available slots</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {availableSlots.map((s) => (
                <TouchableOpacity
                  key={s.t}
                  disabled={!s.free}
                  onPress={() => setSelectedSlot(s.t)}
                  style={[
                    styles.slotBtn,
                    !s.free && { backgroundColor: "#f0f0f0" },
                    selectedSlot === s.t && styles.slotBtnActive,
                  ]}
                >
                  <Text style={[styles.slotText, selectedSlot === s.t && { color: "#fff" }]}>{s.t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Purpose and consultant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Purpose of Visit</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {VISIT_PURPOSES.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => togglePurpose(p.key)} style={[styles.purposeChip, purposes.includes(p.key) && styles.purposeChipActive]}>
                <Text style={[styles.purposeText, purposes.includes(p.key) && { color: "#fff" }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700" }}>Choose Consultant (optional)</Text>
            <TouchableOpacity style={styles.selectRow} onPress={() => setConsultantModalVisible(true)}>
              <View>
                <Text style={styles.branchName}>{consultant ? consultant.name : "Any available consultant"}</Text>
                <Text style={styles.small}>{consultant ? consultant.specialties.join(", ") : "We will assign a consultant based on purpose"}</Text>
              </View>
              <Text style={styles.link}>Select</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity style={[styles.quickBtn, isVip && styles.quickBtnActive]} onPress={() => setIsVip((v) => !v)}>
                <Text style={[styles.quickBtnText, isVip && { color: "#fff" }]}>{isVip ? "VIP Priority: ON" : "VIP Priority"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => { setHomeVisit((h) => !h); if (!isVip && !homeVisit) Alert.alert("Home visit", "Home visit is a VIP feature — enable VIP to book a home visit."); }}>
                <Text style={styles.quickBtnText}>{homeVisit ? "Home Visit: Yes" : "Home Visit"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Group booking */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Group / Family Booking</Text>
            <TouchableOpacity onPress={() => setIsGroupBooking((s) => !s)}><Text style={styles.linkText}>{isGroupBooking ? "Disable" : "Enable"}</Text></TouchableOpacity>
          </View>

          {isGroupBooking && (
            <>
              <Text style={{ marginTop: 10, color: "#666" }}>Add family members joining (name & phone)</Text>
              {groupMembers.map((m, idx) => (
                <View key={m.id} style={{ marginTop: 8 }}>
                  <TextInput placeholder={`Member ${idx + 1} name`} value={m.name} onChangeText={(t) => setGroupMembers((s) => s.map((x) => (x.id === m.id ? { ...x, name: t } : x)))} style={styles.input} />
                  <TextInput placeholder="Phone" value={m.phone} keyboardType="phone-pad" onChangeText={(t) => setGroupMembers((s) => s.map((x) => (x.id === m.id ? { ...x, phone: t } : x)))} style={[styles.input, { marginTop: 6 }]} />
                  {groupMembers.length > 1 && <TouchableOpacity style={{ marginTop: 6 }} onPress={() => removeMember(m.id)}><Text style={{ color: "#d32f2f" }}>Remove member</Text></TouchableOpacity>}
                </View>
              ))}
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10, alignSelf: "flex-start" }]} onPress={addMember}><Text style={styles.primaryBtnText}>Add Member</Text></TouchableOpacity>
            </>
          )}
        </View>

        {/* Special request & reminders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Requests & Reminders</Text>
          <TextInput placeholder="Tell us what you'd like the consultant to prepare..." value={specialRequest} onChangeText={setSpecialRequest} style={[styles.input, { height: 90 }]} multiline />
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={{ color: "#444" }}>Send reminders (SMS / App)</Text>
            <TouchableOpacity onPress={() => setReminder((r) => !r)}><Text style={{ color: reminder ? "#1E90FF" : "#666" }}>{reminder ? "On" : "Off"}</Text></TouchableOpacity>
          </View>
        </View>

        {/* CTA */}
        <View style={{ marginTop: 12, marginBottom: 60 }}>
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirmBooking}><Text style={styles.confirmBtnText}>Confirm Booking</Text></TouchableOpacity>
        </View>

        {/* Booking History */}
        <View style={styles.card}>
          <View style={styles.rowBetween}><Text style={styles.cardTitle}>Your Bookings</Text><Text style={styles.small}>{bookings.length} total</Text></View>
          {bookings.length === 0 ? <Text style={{ color: "#666", marginTop: 8 }}>No bookings yet</Text> : (
            <FlatList data={bookings} keyExtractor={(i) => i.id} renderItem={({ item }) => (
              <View style={styles.bookingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{item.branch.name} • {item.slot}</Text>
                  <Text style={styles.small}>{item.dateDisplay} • {item.group ? `${item.group.length} persons • ` : ""}{item.status}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <TouchableOpacity onPress={() => onViewBooking(item)} style={{ marginBottom: 6 }}><Text style={{ color: "#1E90FF" }}>View</Text></TouchableOpacity>
                  {item.status === "Confirmed" && (
                    <>
                      <TouchableOpacity onPress={() => onReschedule(item)}><Text style={{ color: "#ff9800" }}>Reschedule</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => onCancelBooking(item)} style={{ marginTop: 6 }}><Text style={{ color: "#d32f2f" }}>Cancel</Text></TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )} />
          )}
        </View>
      </ScrollView>

      {/* Branch selection modal */}
      <Modal visible={branchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Branch</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {MOCK_BRANCHES.map((b) => (
                <TouchableOpacity key={b.id} style={styles.listItem} onPress={() => { setBranch(b); setBranchModalVisible(false); }}>
                  <Text style={{ fontWeight: "700" }}>{b.name}</Text>
                  <Text style={styles.small}>{b.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={() => setBranchModalVisible(false)}><Text style={styles.primaryBtnText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Consultant modal */}
      <Modal visible={consultantModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Consultant</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {MOCK_CONSULTANTS.map((c) => (
                <TouchableOpacity key={c.id} style={styles.listItem} onPress={() => onSelectConsultant(c)}>
                  <Text style={{ fontWeight: "700" }}>{c.name} {c.vip ? "• VIP" : ""}</Text>
                  <Text style={styles.small}>{c.specialties.join(", ")}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={() => setConsultantModalVisible(false)}><Text style={styles.primaryBtnText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Booking Confirmed</Text>
            {currentBooking ? (
              <>
                <Text style={{ fontWeight: "700", marginTop: 8 }}>ID: {currentBooking.id}</Text>
                <Text style={styles.small}>Branch: {currentBooking.branch.name}</Text>
                <Text style={styles.small}>When: {currentBooking.dateDisplay} • {currentBooking.slot}</Text>
                <Text style={styles.small}>Consultant: {currentBooking.consultant ? currentBooking.consultant.name : "Assigned at store"}</Text>

                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>QR Token (show at check-in)</Text>
                  <View style={{ padding: 12, backgroundColor: "#f3f3f3", borderRadius: 8, marginTop: 8 }}>
                    <Text selectable style={{ fontFamily: Platform.OS === "ios" ? "Courier" : undefined }}>{currentBooking.qrToken}</Text>
                    <Text style={[styles.small, { marginTop: 8 }]}>(QR image placeholder — integrate 'react-native-qrcode-svg' to render a real code)</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", marginTop: 12 }}>
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => { setConfirmModalVisible(false); onAddToCalendar(currentBooking); }}><Text style={styles.primaryBtnText}>Add to Calendar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8, flex: 1 }]} onPress={() => setConfirmModalVisible(false)}><Text style={styles.ghostBtnText}>Done</Text></TouchableOpacity>
                </View>
              </>
            ) : <Text>Loading…</Text>}
          </View>
        </View>
      </Modal>

      {/* View Booking modal */}
      <Modal visible={viewBookingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Booking details</Text>
            {currentBooking ? (
              <>
                <Text style={{ fontWeight: "700", marginTop: 8 }}>{currentBooking.branch.name}</Text>
                <Text style={styles.small}>{currentBooking.dateDisplay} • {currentBooking.slot}</Text>
                <Text style={[styles.small, { marginTop: 8 }]}>Purpose: {currentBooking.purposes.join(", ")}</Text>
                <Text style={[styles.small, { marginTop: 8 }]}>Status: {currentBooking.status}</Text>
                <View style={{ flexDirection: "row", marginTop: 12 }}>
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => { onAddToCalendar(currentBooking); }}><Text style={styles.primaryBtnText}>Add to Calendar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8, flex: 1 }]} onPress={() => setViewBookingModal(false)}><Text style={styles.ghostBtnText}>Close</Text></TouchableOpacity>
                </View>
              </>
            ) : <Text>Loading…</Text>}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: "#2d2d2d" },
  subtitle: { color: "#666", marginTop: 6, marginBottom: 12 },

  card: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginTop: 12, elevation: 1 },
  cardTitle: { fontWeight: "800", fontSize: 15 },
  selectRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  branchName: { fontWeight: "700" },
  small: { color: "#666", fontSize: 12 },
  link: { color: "#1E90FF", fontWeight: "700" },
  hint: { color: "#777", fontSize: 12, marginTop: 6 },

  dateChip: { padding: 10, marginRight: 8, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eee", width: 120 },
  dateChipActive: { backgroundColor: "#1E90FF" },
  dateChipText: { fontWeight: "700", marginBottom: 4 },

  slotGroupBtn: { flex: 1, padding: 8, marginRight: 8, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
  slotGroupBtnActive: { backgroundColor: "#1E90FF" },
  slotGroupText: { fontWeight: "700" },

  slotBtn: { padding: 8, marginRight: 8, marginBottom: 8, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
  slotBtnActive: { backgroundColor: "#1E90FF" },
  slotText: {},

  purposeChip: { padding: 8, marginRight: 8, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff" },
  purposeChipActive: { backgroundColor: "#1E90FF" },
  purposeText: { fontWeight: "700" },

  quickBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e6e6e6", marginRight: 8, alignItems: "center" },
  quickBtnText: { color: "#333" },
  quickBtnActive: { backgroundColor: "#1E90FF" },

  input: { borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 8, marginTop: 8, backgroundColor: "#fff" },

  confirmBtn: { backgroundColor: "#b8860b", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#fff", fontWeight: "800" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  bookingRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f2f2f2" },

  // modal
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalBox: { width: "92%", backgroundColor: "#fff", padding: 16, borderRadius: 10 },
  modalTitle: { fontWeight: "800", fontSize: 18 },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f6f6f6" },

  primaryBtn: { backgroundColor: "#1E90FF", padding: 12, borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: { borderWidth: 1, borderColor: "#1E90FF", padding: 12, borderRadius: 8, alignItems: "center" },
  ghostBtnText: { color: "#1E90FF", fontWeight: "700" },

  linkText: { color: "#1E90FF", fontWeight: "700" },
});
