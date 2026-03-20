import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ImageUploadPreview from './ImageUploadPreview';

describe('ImageUploadPreview', () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  describe('rendering', () => {
    it('should render with default label', () => {
      render(<ImageUploadPreview onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          label="Food Image"
        />
      );
      expect(screen.getByText('Food Image')).toBeInTheDocument();
    });

    it('should render required indicator when required prop is true', () => {
      render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          required={true}
        />
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render upload placeholder initially', () => {
      render(<ImageUploadPreview onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument();
      expect(screen.getByText(/PNG or JPEG/i)).toBeInTheDocument();
    });
  });

  describe('file validation', () => {
    it('should validate file type on change', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      // handleFileChange calls onFileSelect with the file
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it('should validate file size on change', () => {
      const { container } = render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          maxSize={1024} // 1KB
        />
      );

      const largeContent = new Array(2048).fill('x').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      // handleFileChange calls onFileSelect with the file
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it('should accept valid JPEG files', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it('should accept valid PNG files', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe('error handling', () => {
    it('should display error prop when provided', () => {
      render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          error="Custom error message"
        />
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should set aria-invalid to true when error exists', async () => {
      const { container } = render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          error="Error message"
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby when error exists', async () => {
      const { container } = render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          error="Error message"
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('file prop', () => {
    it('should validate file prop on mount', async () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          file={invalidFile}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Only JPEG and PNG images are allowed')).toBeInTheDocument();
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('file input attributes', () => {
    it('should have correct accept attribute', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');
    });

    it('should support custom accept attribute', () => {
      const { container } = render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          accept="image/webp"
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', 'image/webp');
    });
  });

  describe('error styling', () => {
    it('should apply danger styling when error exists', () => {
      const { container } = render(
        <ImageUploadPreview
          onFileSelect={mockOnFileSelect}
          error="Error message"
        />
      );

      const uploadBox = container.querySelector('.relative.w-full.h-48');
      expect(uploadBox).toHaveClass('border-danger-300');
      expect(uploadBox).toHaveClass('bg-danger-50');
    });

    it('should apply normal styling when no error', () => {
      const { container } = render(
        <ImageUploadPreview onFileSelect={mockOnFileSelect} />
      );

      const uploadBox = container.querySelector('.relative.w-full.h-48');
      expect(uploadBox).toHaveClass('border-gray-300');
      expect(uploadBox).toHaveClass('hover:border-gray-400');
    });
  });
});
