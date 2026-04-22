import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';

const SPACE_TYPES = [
  { value: 'land', label: '🌾 Land', color: '#4CAF50' },
  { value: 'warehouse', label: '🏭 Warehouse', color: '#FF9800' },
  { value: 'storage', label: '📦 Storage', color: '#9C27B0' },
  { value: 'shipping_container', label: '🚢 Container', color: '#2196F3' },
  { value: 'aviation_hangar', label: '✈️ Aviation', color: '#E91E63' },
  { value: 'train_cargo', label: '🚂 Train', color: '#795548' },
  { value: 'office', label: '🏢 Office', color: '#607D8B' },
  { value: 'retail', label: '🏪 Retail', color: '#00BCD4' },
];

const CURRENCIES = ['USD', 'SAR', 'AED', 'EUR', 'GBP'];
const PRICE_TYPES = ['month', 'year', 'sqm', 'total'];

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  priceType: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
  };
  amenities: string[];
  images: string[];
}

const AddSpaceScreen = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    priceType: 'month',
    dimensions: { length: '', width: '', height: '' },
    location: { address: '', city: '', country: '' },
    amenities: [],
    images: [],
  });

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateDimensions = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [key]: value },
    }));
  };

  const updateLocation = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
    }));
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      updateFormData('images', [...formData.images, ...uris]);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!selectedType) {
          Alert.alert('Required', 'Please select a space type');
          return false;
        }
        return true;
      case 2:
        if (!formData.title || !formData.description || !formData.price) {
          Alert.alert('Required', 'Please fill in all required fields');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.location.city || !formData.location.country) {
          Alert.alert('Required', 'Please enter city and country');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        spaceType: selectedType,
        price: parseFloat(formData.price),
        dimensions: {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0,
          area:
            (parseFloat(formData.dimensions.length) || 0) *
            (parseFloat(formData.dimensions.width) || 0),
        },
      };

      await api.post('/properties', payload);
      Alert.alert('Success', 'Space added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add space'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotCompleted,
          ]}
        >
          <Text style={styles.stepDotText}>{s < step ? '✓' : s}</Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Space Type</Text>
      <Text style={styles.stepSubtitle}>
        Choose the type of space you want to list
      </Text>
      <View style={styles.typesGrid}>
        {SPACE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              selectedType === type.value && [
                styles.typeCardSelected,
                { borderColor: type.color },
              ],
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text style={styles.typeEmoji}>{type.label.split(' ')[0]}</Text>
            <Text style={styles.typeLabel}>{type.label.split(' ')[1]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>
        Enter the details about your space
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Modern Warehouse in Riyadh"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your space..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex2]}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="10000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => updateFormData('price', text)}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.pickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.pickerItem,
                    formData.currency === curr && styles.pickerItemActive,
                  ]}
                  onPress={() => updateFormData('currency', curr)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      formData.currency === curr && styles.pickerItemTextActive,
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price Type</Text>
        <View style={styles.priceTypeContainer}>
          {PRICE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.priceTypeItem,
                formData.priceType === type && styles.priceTypeItemActive,
              ]}
              onPress={() => updateFormData('priceType', type)}
            >
              <Text
                style={[
                  styles.priceTypeText,
                  formData.priceType === type && styles.priceTypeTextActive,
                ]}
              >
                Per {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Dimensions</Text>
      <Text style={styles.stepSubtitle}>
        Enter the dimensions of your space
      </Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Length (m)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.dimensions.length}
            onChangeText={(text) => updateDimensions('length', text)}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Width (m)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.dimensions.width}
            onChangeText={(text) => updateDimensions('width', text)}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Height (m)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.dimensions.height}
            onChangeText={(text) => updateDimensions('height', text)}
          />
        </View>
      </View>

      {formData.dimensions.length && formData.dimensions.width && (
        <View style={styles.areaDisplay}>
          <Text style={styles.areaLabel}>Calculated Area</Text>
          <Text style={styles.areaValue}>
            {(
              parseFloat(formData.dimensions.length) *
              parseFloat(formData.dimensions.width)
            ).toFixed(0)}{' '}
            m²
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepSubtitle}>
        Where is your space located?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Street address"
          placeholderTextColor="#999"
          value={formData.location.address}
          onChangeText={(text) => updateLocation('address', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#999"
            value={formData.location.city}
            onChangeText={(text) => updateLocation('city', text)}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            placeholder="Country"
            placeholderTextColor="#999"
            value={formData.location.country}
            onChangeText={(text) => updateLocation('country', text)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Images</Text>
      <Text style={styles.stepSubtitle}>
        Add photos of your space
      </Text>

      <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
        <Text style={styles.imageButtonIcon}>📸</Text>
        <Text style={styles.imageButtonText}>
          Select Images ({formData.images.length})
        </Text>
      </TouchableOpacity>

      {formData.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagePreviewScroll}
        >
          {formData.images.map((uri, index) => (
            <View key={index} style={styles.imagePreview}>
              <Text style={styles.imagePreviewText}>📷 Image {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  const newImages = [...formData.images];
                  newImages.splice(index, 1);
                  updateFormData('images', newImages);
                }}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryItem}>
          Type: {SPACE_TYPES.find((t) => t.value === selectedType)?.label}
        </Text>
        <Text style={styles.summaryItem}>Title: {formData.title}</Text>
        <Text style={styles.summaryItem}>
          Price: {formData.currency} {formData.price} / {formData.priceType}
        </Text>
        <Text style={styles.summaryItem}>
          Location: {formData.location.city}, {formData.location.country}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Space</Text>
        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          {step < 5 ? (
            <TouchableOpacity
              style={[styles.nextButton, step === 1 && styles.fullWidth]}
              onPress={nextStep}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : '✓ Submit Space'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  stepDotActive: {
    backgroundColor: '#4CAF50',
  },
  stepDotCompleted: {
    backgroundColor: '#81C784',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    backgroundColor: '#E8F5E9',
  },
  typeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  flex1: {
    flex: 1,
    marginHorizontal: 6,
  },
  flex2: {
    flex: 2,
    marginHorizontal: 6,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
  },
  pickerItemActive: {
    backgroundColor: '#4CAF50',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#666',
  },
  pickerItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceTypeItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
  },
  priceTypeItemActive: {
    backgroundColor: '#4CAF50',
  },
  priceTypeText: {
    fontSize: 14,
    color: '#666',
  },
  priceTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  areaDisplay: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  areaLabel: {
    fontSize: 14,
    color: '#666',
  },
  areaValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  imageButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imageButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#666',
  },
  imagePreviewScroll: {
    marginTop: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  imagePreviewText: {
    fontSize: 12,
    color: '#666',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidth: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabled: {
    opacity: 0.7,
  },
});

export default AddSpaceScreen;
