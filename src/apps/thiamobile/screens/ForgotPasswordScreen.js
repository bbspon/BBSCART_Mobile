import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { forgotPassword, verifyOTP, resetPassword } from '../services/authAPI';
import { useTheme } from '../contexts/ThemeContext';

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // 👁 Visibility toggles
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailSubmit = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await forgotPassword({ email });
            setOtpSent(true);
            setSuccess(res.data?.message || 'OTP has been sent to your email.');
            setStep(2); // Move to OTP step
        } catch (err) {
            console.error('Forgot password error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
            setError(errorMessage);
            setOtpSent(false);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(otp)) {
            setError('OTP must be exactly 6 digits.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await verifyOTP({ email, otp });
            setError('');
            setSuccess(res.data?.message || 'OTP verified successfully!');
            setStep(3); // Move to password reset step
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        // Strong password validation (matching web version)
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await resetPassword({ email, otp, newPassword });
            setError('');
            setSuccess(res.data?.message || 'Password successfully updated!');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigation.navigate('SignIn');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: 25,
            paddingTop: 50,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.7,
            marginBottom: 25,
            textAlign: 'center',
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 10,
            fontSize: 15,
            marginBottom: 15,
            color: colors.text,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 15,
        },
        passwordInput: {
            flex: 1,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.text,
        },
        button: {
            backgroundColor: '#FFD700',
            paddingVertical: 15,
            borderRadius: 50,
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 4,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: '#000',
            fontWeight: 'bold',
            fontSize: 16,
        },
        footerText: {
            textAlign: 'center',
            color: colors.text,
            opacity: 0.7,
            fontSize: 14,
        },
        link: {
            color: colors.primary,
            fontWeight: 'bold',
        },
        errorText: {
            color: '#ff4444',
            fontSize: 14,
            marginBottom: 10,
            textAlign: 'center',
        },
        successText: {
            color: '#4CAF50',
            fontSize: 14,
            marginBottom: 10,
            textAlign: 'center',
        },
    });

    return (
        <KeyboardAvoidingView
            style={dynamicStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                style={dynamicStyles.container}
                contentContainerStyle={[dynamicStyles.scrollContent, { paddingBottom: 24 + Math.max(12, insets.bottom) + 8 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={dynamicStyles.title}>Forgot Password</Text>
                <Text style={dynamicStyles.subtitle}>
                    Enter your registered email to reset your password.
                </Text>

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={dynamicStyles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Success Message */}
                {success ? (
                    <View style={styles.successContainer}>
                        <Text style={dynamicStyles.successText}>{success}</Text>
                    </View>
                ) : null}

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <>
                        <TextInput
                            placeholder="Enter email"
                            placeholderTextColor={colors.text + '80'}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setError('');
                            }}
                            style={dynamicStyles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[dynamicStyles.button, loading && dynamicStyles.buttonDisabled]}
                            onPress={handleEmailSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={dynamicStyles.buttonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <>
                        <TextInput
                            placeholder="Enter 6-digit OTP"
                            placeholderTextColor={colors.text + '80'}
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text.replace(/[^0-9]/g, '')); // Only numbers
                                setError('');
                            }}
                            style={dynamicStyles.input}
                            keyboardType="numeric"
                            maxLength={6}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[dynamicStyles.button, loading && dynamicStyles.buttonDisabled]}
                            onPress={handleOtpVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={dynamicStyles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setStep(1);
                                setOtp('');
                                setError('');
                                setSuccess('');
                            }}
                            style={{ marginTop: 10 }}
                        >
                            <Text style={[dynamicStyles.footerText, { color: colors.primary }]}>
                                Change email address
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                    <>
                        {/* New Password */}
                        <View style={dynamicStyles.passwordContainer}>
                            <TextInput
                                placeholder="Enter new password"
                                placeholderTextColor={colors.text + '80'}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    setError('');
                                }}
                                style={dynamicStyles.passwordInput}
                                secureTextEntry={!showNewPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Icon
                                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <View style={dynamicStyles.passwordContainer}>
                            <TextInput
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.text + '80'}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setError('');
                                }}
                                style={dynamicStyles.passwordInput}
                                secureTextEntry={!showConfirmPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Icon
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[dynamicStyles.button, loading && dynamicStyles.buttonDisabled]}
                            onPress={handlePasswordReset}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={dynamicStyles.buttonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setStep(2);
                                setNewPassword('');
                                setConfirmPassword('');
                                setError('');
                                setSuccess('');
                            }}
                            style={{ marginTop: 10 }}
                        >
                            <Text style={[dynamicStyles.footerText, { color: colors.primary }]}>
                                Back to OTP verification
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Back to Sign In */}
                <Text style={dynamicStyles.footerText}>
                    Remember password?{' '}
                    <Text
                        style={dynamicStyles.link}
                        onPress={() => navigation.navigate('SignIn')}
                    >
                        Sign In
                    </Text>
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ff4444',
    },
    successContainer: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
});

export default ForgotPasswordScreen;
