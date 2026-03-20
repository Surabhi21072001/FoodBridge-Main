import React, { useState, useEffect } from 'react';
import type { UpdateListingData } from '../../types/listings';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ImageUploadPreview from '../shared/ImageUploadPreview';
import useToast from '../../hooks/useToast';
import listingsService from '../../services/listingsService';

export interface EditListingFormProps {
  listingId: string;
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
  status?: string;
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'completed', label: 'Completed' },
  { value: 'unavailable', label: 'Unavailable' },
];

const EditListingForm: React.FC<EditListingFormProps> = ({ listingId, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<UpdateListingData>({
    food_name: '',
    description: '',
    quantity: 0,
    location: '',
    pickup_window_start: '',
    pickup_window_end: '',
    food_type: '',
    dietary_tags: [],
    status: 'active',
  });

  // Fetch listing data on mount
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingsService.getListingById(listingId);
        setFormData({
          food_name: data.food_name,
          description: data.description,
          quantity: data.quantity,
          location: data.location,
          pickup_window_start: data.pickup_window_start,
          pickup_window_end: data.pickup_window_end,
          food_type: data.food_type,
          dietary_tags: data.dietary_tags,
          status: data.status,
        });
        setSelectedDietaryTags(data.dietary_tags);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to load listing. Please try again.';
        showToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId, showToast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.food_name?.trim()) {
      newErrors.food_name = 'Food name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.quantity !== undefined && formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.food_type) {
      newErrors.food_type = 'Food type is required';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } else {
      setFormData((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await listingsService.updateListing(listingId, formData);
      showToast('Listing updated successfully!', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update listing. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Food Name */}
      <Input
        label="Food Name"
        name="food_name"
        type="text"
        placeholder="e.g., Leftover Pizza"
        value={formData.food_name || ''}
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
          value={formData.description || ''}
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
        value={formData.location || ''}
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
          value={formData.food_type || ''}
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

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || 'active'}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            errors.status
              ? 'border-danger-500 bg-danger-50 focus:ring-danger-500'
              : 'border-gray-300 bg-white focus:ring-primary-500'
          }`}
          data-testid="status-select"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-danger-600" role="alert">
            {errors.status}
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
          value={formData.pickup_window_start || ''}
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
          value={formData.pickup_window_end || ''}
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
          data-testid="submit-button"
        >
          Update Listing
        </Button>
      </div>
    </form>
  );
};

export default EditListingForm;
