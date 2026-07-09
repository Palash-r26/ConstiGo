import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface AuthInputProps extends TextInputProps {
  placeholder: string;
  isPassword?: boolean;
  leftIcon?: string;
  className?: string;
}

export const AuthInput = ({ placeholder, isPassword = false, leftIcon, className = '', ...props }: AuthInputProps) => {
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View className={`flex-row items-center bg-input-bg rounded-2xl px-5 py-4 ${className}`}>
      {leftIcon && <Icon name={leftIcon} size={20} color="#8A8A8E" style={{ marginRight: 10 }} />}
      <TextInput
        className="flex-1 text-base text-text-primary font-outfit"
        placeholder={placeholder}
        placeholderTextColor="#8A8A8E"
        secureTextEntry={isSecure}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} activeOpacity={0.7}>
          <Icon name={isSecure ? 'eye-off' : 'eye'} size={20} color="#8A8A8E" />
        </TouchableOpacity>
      )}
    </View>
  );
};
