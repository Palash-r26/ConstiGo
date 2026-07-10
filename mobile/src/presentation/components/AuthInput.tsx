import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Typography } from './Typography';

interface AuthInputProps extends TextInputProps {
  placeholder: string;
  isPassword?: boolean;
  leftIcon?: string;
  className?: string;
  error?: string;
  fill?: 'light' | 'dark';
}

export const AuthInput = ({ placeholder, isPassword = false, leftIcon, className = '', error, fill = 'light', ...props }: AuthInputProps) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  const bgClass = error ? 'bg-red-50 border border-red-500' : fill === 'dark' ? 'bg-[#E2E5EA]' : 'bg-input-bg';

  return (
    <View className="mb-2">
      <View className={`flex-row items-center rounded-2xl px-5 py-4 ${bgClass} ${className}`}>
        {leftIcon && <Icon name={leftIcon} size={20} color={error ? "#EF4444" : "#9C101A"} style={{ marginRight: 10 }} />}
        <TextInput
          className="flex-1 text-base text-text-primary"
          style={{ fontFamily: 'Montserrat-Regular', paddingVertical: 0 }}
          placeholder={placeholder}
          placeholderTextColor={error ? "#EF4444" : "#8A8A8E"}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} activeOpacity={0.7}>
            <Icon name={isSecure ? 'eye-off' : 'eye'} size={20} color={error ? "#EF4444" : "#8A8A8E"} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Typography variant="bodySmall" className="text-red-500 ml-2 mt-1">{error}</Typography> : null}
    </View>
  );
};
