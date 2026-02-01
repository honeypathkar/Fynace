import React, { useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import styles from './styles';

const OTPInput = ({ otp, setOtp, otpInputRefs }) => {
  useEffect(() => {
    // Auto-focus first input when OTP is ready
    if (otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, []);

  return (
    <View style={styles.otpContainer}>
      {[0, 1, 2, 3].map(i => (
        <TextInput
          key={`otp-${i}`}
          ref={ref => {
            if (ref) {
              otpInputRefs.current[i] = ref;
            }
          }}
          value={otp[i] || ''}
          onChangeText={val => {
            const cleaned = (val || '').replace(/[^0-9]/g, '').slice(0, 1);
            const newOtp =
              (otp + '____').slice(0, i) + cleaned + (otp.slice(i + 1) || '');
            const finalOtp = newOtp.slice(0, 4);
            setOtp(finalOtp);

            // Auto-focus next input if digit entered and not last box
            if (cleaned && i < 3) {
              otpInputRefs.current[i + 1]?.focus();
            }
          }}
          onKeyPress={({ nativeEvent }) => {
            // Handle backspace to go to previous input
            if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
              otpInputRefs.current[i - 1]?.focus();
            }
          }}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.otpBox}
          textAlign="center"
        />
      ))}
    </View>
  );
};

export default OTPInput;
