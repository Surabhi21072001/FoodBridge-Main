import React, { useState } from 'react';
import type { CreateListingData } from '../../types/listings';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ImageUploadPreview from '../shared/ImageUploadPreview';
import useToast from '../../hooks/useToast';
import listingsService from '../../services/listingsService';

export interface CreateListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  food_name?: string;
  description?: string;
  quantity?: string;
  location?: string;
  pickup_window_start?: string;
  pickup_window_end?: string;
  food_type?: string;
  dietary_tags?: string;
  listing_type?: string;
  image?: string;
}

const FOOD_TYPES = [
  'Prepared Meal',
  'Bakery',
  'Produce',
  'Dairy',
  'Meat/Protein',
  'Pantry Items',
  'Beverages',
  'Other',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
];

const LISTING_TYPES = [
  { value: 'donation', label: 'Donation' },
  { value: 'event', label: 'Event' },
  { value: 'dining_deal', label: 'Dining Deal' },
];

const CreateListingForm: React.FC<CreateListingFormProps> = ({ onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CreateListingData>({
    food_name: '',
    description: '',
    quantity: 0,
    location: '',
    pickup_window_start: '',
    pickup_window_end: '',
    food_type: '',
    dietary_tags: [],
    listing_type: 'donation',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.food_name.trim()) {
      newErrors.food_name = 'Food name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.food_type) {
      newErrors.food_type = 'Food type is required';
    }

    if (!formData.listing_type) {
      newErrors.listing_type = 'Listing type is required';
    }

    // Pickup window validation
    if (!formData.pickup_window_start) {
      newErrors.pickup_window_start = 'Pickup start time is required';
    }

    if (!formData.pickup_window_end) {
      newErrors.pickup_window_end = 'Pickup end time is required';
    }

    // Validate end time is after start time
    if (formData.pickup_window_start && formData.pickup_window_end) {
      const startTime = new Date(formData.pickup_window_start);
      const endTime = new Date(formData.pickup_window_end);
      if (endTime <= startTime) {
        newErrors.pickup_window_end = 'Pickup end time must be after start time';
      }
    }

    // Image validation
    if (selectedImage) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedImage.size > maxSize) {
        newErrors.image = 'Image must be less than 5MB';
      }
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedImage.type)) {
        newErrors.image = 'Image must be JPG or PNG format';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[CreateListingForm] Validation result:', isValid, 'errors:', newErrors);
    return isValid;
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const handleDietaryTagChange = (tag: string) => {
    setSelectedDietaryTags((prev) => {
      const updated = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setFormData((prevData) => ({
        ...prevData,
        dietary_tags: updated,
      }));
      return updated;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    console.log('[CreateListingForm] Submit triggered, formData:', formData);

    if (!validateForm()) {
      console.log('[CreateListingForm] Validation failed, errors:', errors);
      showToast('Please fix the errors in the form before submitting.', 'error');
      // Scroll to the first error field
      setTimeout(() => {
        const firstError = document.querySelector('[role="alert"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    console.log('[CreateListingForm] Validation passed, calling API...');
    setIsSubmitting(true);
    try {
      const result = await listingsService.createListing(formData);
      console.log('[CreateListingForm] API success:', result);
      showToast('Listing created successfully!', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create listing. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      {/* Food Name */}
      <Input
        label="Food Name"
        name="food_name"
        type="text"
        placeholder="e.g., Leftover Pizza"
        value={formData.food_name}
        onChange={handleInputChange}
        error={errors.food_name}
        required
        disabled={isSubmitting}
        data-testid="food-name-input"
      />

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-danger-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe the food, ingredients, and any special notes"
          value={formData.description}
          onChange={handleInputChange}
          disabled={isSubmitting}
          rows={4}
          className={`w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            errors.description
              ? 'border-danger-500 bg-danger-50 focus:ring-danger-500'
              : 'border-gray-300 bg-white focus:ring-primary-500'
          }`}
          data-testid="description-input"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-danger-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Quantity */}
      <Input
        label="Quantity"
        name="quantity"
        type="number"
        min="1"
        placeholder="Number of servings or units"
        value={formData.quantity || ''}
        onChange={handleInputChange}
        error={errors.quantity}
        required
        disabled={isSubmitting}
        data-testid="quantity-input"
      />

      {/* Location */}
      <Input
        label="Pickup Location"
        name="location"
        type="text"
        placeholder="e.g., Student Center, Room 101"
        value={formData.location}
        onChange={handleInputChange}
        error={errors.location}
        required
        disabled={isSubmitting}
        data-testid="location-input"
      />

      {/* Food Type */}
      <div>
        <label htmlFor="food_type" className="block text-sm font-medium text-gray-700 mb-1">
          Food Type <span className="text-danger-600">*</span>
        </label>
        <select
          id="food_type"
          name="food_type"
          value={formData.food_type}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            errors.food_type
              ? 'border-danger-500 bg-danger-50 focus:ring-danger-500'
              : 'border-gray-300 bg-white focus:ring-primary-500'
          }`}
          data-testid="food-type-select"
        >
          <option value="">Select a food type</option>
          {FOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.food_type && (
          <p className="mt-1 text-sm text-danger-600" role="alert">
            {errors.food_type}
          </p>
        )}
      </div>

      {/* Listing Type */}
      <div>
        <label htmlFor="listing_type" className="block text-sm font-medium text-gray-700 mb-1">
          Listing Type <span className="text-danger-600">*</span>
        </label>
        <select
          id="listing_type"
          name="listing_type"
          value={formData.listing_type}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            errors.listing_type
              ? 'border-danger-500 bg-danger-50 focus:ring-danger-500'
              : 'border-gray-300 bg-white focus:ring-primary-500'
          }`}
          data-testid="listing-type-select"
        >
          {LISTING_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.listing_type && (
          <p className="mt-1 text-sm text-danger-600" role="alert">
            {errors.listing_type}
          </p>
        )}
      </div>

      {/* Dietary Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
        <div className="space-y-2">
          {DIETARY_OPTIONS.map((tag) => (
            <label key={tag} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedDietaryTags.includes(tag)}
                onChange={() => handleDietaryTagChange(tag)}
                disabled={isSubmitting}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                data-testid={`dietary-tag-${tag}`}
              />
              <span className="ml-2 text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pickup Window */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pickup Start Time"
          name="pickup_window_start"
          type="datetime-local"
          value={formData.pickup_window_start}
          onChange={handleInputChange}
          error={errors.pickup_window_start}
          required
          disabled={isSubmitting}
          data-testid="pickup-start-input"
        />
        <Input
          label="Pickup End Time"
          name="pickup_window_end"
          type="datetime-local"
          value={formData.pickup_window_end}
          onChange={handleInputChange}
          error={errors.pickup_window_end}
          required
          disabled={isSubmitting}
          data-testid="pickup-end-input"
        />
      </div>

      {/* Image Upload */}
      <ImageUploadPreview
        onFileSelect={handleImageChange}
        file={selectedImage}
        label="Food Image (Optional)"
        error={errors.image}
        accept="image/jpeg,image/png"
        maxSize={5 * 1024 * 1024}
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
          onClick={handleSubmit}
          data-testid="submit-button"
        >
          Create Listing
        </Button>
      </div>
    </form>
  );
};

export default CreateListingForm;
