import React, { useState } from 'react';
import { TextInput, Text, View, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import styles from './styles';

const theme = {
  colors: {
    textSubtle: '#A7B3CC',
    textMuted: '#94A3B8',
  },
};

const TextInputField = ({
  label,
  secureTextEntry,
  style,
  accessory,
  onToggleSecureEntry,
  isSecureVisible,
  containerStyle,
  inputContainerStyle,
  inputRef,
  rightIcon,
  onRightIconPress,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalSecureVisible, setInternalSecureVisible] = useState(false);
  
  // Use provided isSecureVisible or internal state
  const secureVisible = isSecureVisible !== undefined ? isSecureVisible : internalSecureVisible;
  const handleToggleSecure = onToggleSecureEntry || (() => setInternalSecureVisible(!internalSecureVisible));
  const showToggle = secureTextEntry && (typeof onToggleSecureEntry === 'function' || secureTextEntry);

  return (
    <View style={[styles.inputWrapper, containerStyle, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View
        style={[
          styles.inputFieldContainer,
          isFocused && styles.inputFieldFocused,
          inputContainerStyle,
        ]}>
        <TextInput
          ref={inputRef}
          style={styles.inputField}
          secureTextEntry={secureTextEntry && !secureVisible}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {accessory}
        {showToggle ? (
          <TouchableOpacity
            onPress={handleToggleSecure}
            style={styles.inputToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {secureVisible ? (
              <EyeOff size={20} color={theme.colors.textSubtle} />
            ) : (
              <Eye size={20} color={theme.colors.textSubtle} />
            )}
          </TouchableOpacity>
        ) : null}
        {rightIcon && onRightIconPress ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.inputToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {rightIcon === 'eye' ? (
              <Eye size={20} color={theme.colors.textSubtle} />
            ) : rightIcon === 'eye-off' ? (
              <EyeOff size={20} color={theme.colors.textSubtle} />
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default TextInputField;


