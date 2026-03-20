import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

describe('Card Component', () => {
  describe('Card Base Component', () => {
    it('should render a card element', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should have base card styling', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-gray-200');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should have hover effect', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('hover:shadow-md');
    });

    it('should accept custom className', () => {
      render(<Card className="custom-class">Card content</Card>);
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('custom-class');
    });

    it('should accept HTML attributes', () => {
      render(<Card data-testid="custom-card">Card content</Card>);
      const card = screen.getByTestId('custom-card');
      expect(card).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
        </Card>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('CardHeader Component', () => {
    it('should render a card header element', () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText('Header content').closest('div');
      expect(header).toBeInTheDocument();
    });

    it('should have header styling with border', () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText('Header content').closest('div');
      expect(header).toHaveClass('px-6');
      expect(header).toHaveClass('py-4');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-gray-200');
    });

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>);
      const header = screen.getByText('Header content').closest('div');
      expect(header).toHaveClass('custom-header');
    });

    it('should accept HTML attributes', () => {
      render(<CardHeader data-testid="custom-header">Header content</CardHeader>);
      const header = screen.getByTestId('custom-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardBody Component', () => {
    it('should render a card body element', () => {
      render(<CardBody>Body content</CardBody>);
      const body = screen.getByText('Body content').closest('div');
      expect(body).toBeInTheDocument();
    });

    it('should have body styling', () => {
      render(<CardBody>Body content</CardBody>);
      const body = screen.getByText('Body content').closest('div');
      expect(body).toHaveClass('px-6');
      expect(body).toHaveClass('py-4');
    });

    it('should accept custom className', () => {
      render(<CardBody className="custom-body">Body content</CardBody>);
      const body = screen.getByText('Body content').closest('div');
      expect(body).toHaveClass('custom-body');
    });

    it('should accept HTML attributes', () => {
      render(<CardBody data-testid="custom-body">Body content</CardBody>);
      const body = screen.getByTestId('custom-body');
      expect(body).toBeInTheDocument();
    });
  });

  describe('CardFooter Component', () => {
    it('should render a card footer element', () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText('Footer content').closest('div');
      expect(footer).toBeInTheDocument();
    });

    it('should have footer styling with border and background', () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText('Footer content').closest('div');
      expect(footer).toHaveClass('px-6');
      expect(footer).toHaveClass('py-4');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-gray-200');
      expect(footer).toHaveClass('bg-gray-50');
    });

    it('should accept custom className', () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>);
      const footer = screen.getByText('Footer content').closest('div');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should accept HTML attributes', () => {
      render(<CardFooter data-testid="custom-footer">Footer content</CardFooter>);
      const footer = screen.getByTestId('custom-footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Card Composition', () => {
    it('should render complete card with header, body, and footer', () => {
      render(
        <Card>
          <CardHeader>Card Title</CardHeader>
          <CardBody>Card content goes here</CardBody>
          <CardFooter>Card actions</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Card actions')).toBeInTheDocument();
    });

    it('should render card with only header and body', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body</CardBody>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
    });

    it('should render card with only body', () => {
      render(
        <Card>
          <CardBody>Body only</CardBody>
        </Card>
      );

      expect(screen.getByText('Body only')).toBeInTheDocument();
    });

    it('should render card with multiple body sections', () => {
      render(
        <Card>
          <CardBody>First section</CardBody>
          <CardBody>Second section</CardBody>
        </Card>
      );

      expect(screen.getByText('First section')).toBeInTheDocument();
      expect(screen.getByText('Second section')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should maintain proper spacing between sections', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const header = container.querySelector('[class*="border-b"]');
      const footer = container.querySelector('[class*="border-t"]');

      expect(header).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });

    it('should apply transition effects', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('transition-shadow');
    });
  });
});
