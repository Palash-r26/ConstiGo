import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Typography, Button, AuthInput, ScreenWrapper, Logo, useAuthStore } from '@constigo/shared';
import Icon from 'react-native-vector-icons/Feather';
import { checkWorkerLogin } from '../../services/api/workerApi';

export const WorkerSignInScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleWorkerLogin = async () => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your 10-digit mobile number or Worker ID');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const res = await checkWorkerLogin(cleanId);
      if (res.success && res.worker) {
        const worker = res.worker;
        const workerId = worker.workerid || worker.id || `CW_${cleanId}`;

        await login(
          {
            _id: String(workerId),
            workerid: String(workerId),
            phone: worker.phone || cleanId,
            fullname: worker.fullname || 'Registered Worker',
            firstName: worker.fullname || 'Registered Worker',
            skill: worker.skill || '',
            location: worker.location || '',
            service_charge: worker.service_charge || '',
            visit_charge: worker.visit_charge || '',
            role: 'WORKER',
          },
          `worker_token_${workerId}`
        );
      } else {
        setError(
          res.error ||
            'No registered worker found with this mobile number. Please verify or register as a new worker.'
        );
      }
    } catch (err: any) {
      console.error('[Worker SignIn] Error:', err);
      setError(err.message || 'Worker sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Back Navigation to Role Select */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('RoleSelect')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#F8FAFC',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Header & Logo - Shifted upwards without large negative gap */}
          <View className="items-center mb-6">
            <Logo size="md" style={{ marginBottom: 12 }} />
            <View style={styles.badgeWrap}>
              <Icon name="tool" size={14} color="#047857" style={{ marginRight: 6 }} />
              <Typography style={[styles.badgeText, { color: '#047857' }]}>WORKER PORTAL</Typography>
            </View>
            <Typography variant="h1Black" className="text-3xl text-[#111827] text-center mb-1">
              Worker Sign In
            </Typography>
            <Typography
              variant="bodySmall"
              className="text-sm text-text-secondary text-center px-4 leading-5"
            >
              Sign in with your mobile number to view your profile,{'\n'}update your trade skills, and modify rates
            </Typography>
          </View>

          {/* Form Inputs */}
          <View className="gap-y-4 mb-4">
            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Typography style={styles.errorText}>{error}</Typography>
              </View>
            ) : null}

            <AuthInput
              placeholder="Registered Mobile Number / Worker ID"
              leftIcon="phone"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError('');
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          {/* Info Hint */}
          <View style={styles.hintCard}>
            <Icon name="info" size={15} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
            <Typography style={styles.hintText}>
              Enter the 10-digit mobile number you used during worker registration (e.g. 9876543212).
            </Typography>
          </View>

          {/* Sign In Button */}
          <Button
            title="Sign In as Worker"
            onPress={handleWorkerLogin}
            isLoading={isLoading}
            className="rounded-full shadow-md mb-6"
            style={{ backgroundColor: '#047857' }}
          />

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mb-4">
            <Typography variant="bodyBold" className="text-[#111827] text-sm mr-1">
              New worker looking for site work?
            </Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate('WorkerSignUp')}
              className="py-1"
              activeOpacity={0.7}
            >
              <Typography variant="bodyBold" className="text-[#047857] text-sm underline">
                Register as Worker
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 8,
  },
  badgeText: {
    color: '#8B0000',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  hintText: {
    color: '#166534',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    lineHeight: 17,
  },
});
