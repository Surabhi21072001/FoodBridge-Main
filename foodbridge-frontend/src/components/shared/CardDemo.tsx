import React from 'react';
import Card, { CardHeader, CardBody, CardFooter } from './Card';
import Button from './Button';

const CardDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Card Component Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Card */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Basic Card</h2>
          <Card>
            <CardBody>
              <p className="text-gray-600">This is a simple card with just body content.</p>
            </CardBody>
          </Card>
        </div>

        {/* Card with Header and Body */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Card with Header</h2>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Card Title</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600">This card has a header and body section.</p>
            </CardBody>
          </Card>
        </div>

        {/* Complete Card */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Complete Card</h2>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Food Listing</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-2">
                <strong>Pizza Slices</strong>
              </p>
              <p className="text-sm text-gray-500">
                Fresh pizza available for pickup today from 5-7 PM at the dining hall.
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  Reserve
                </Button>
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Card with Multiple Body Sections */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Multiple Sections</h2>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Reservation Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Item:</span>{' '}
                  <span className="text-gray-600">Pasta Salad</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Quantity:</span>{' '}
                  <span className="text-gray-600">2 servings</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Pickup:</span>{' '}
                  <span className="text-gray-600">Today 6:00 PM</span>
                </p>
              </div>
            </CardBody>
            <CardFooter>
              <Button variant="primary" size="sm" className="w-full">
                Confirm Reservation
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Card with Custom Styling */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Custom Styled Card</h2>
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader className="border-primary-200 bg-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Special Offer</h3>
            </CardHeader>
            <CardBody>
              <p className="text-primary-700">
                Get 20% off on all pantry items this week!
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Minimal Card */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Minimal Card</h2>
          <Card>
            <CardBody className="text-center">
              <p className="text-gray-600">No header or footer, just content.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardDemo;
