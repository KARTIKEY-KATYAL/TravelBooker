import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TravelOption } from "@shared/schema";

interface TravelOptionCardProps {
  option: TravelOption;
  onSelect: () => void;
}

export default function TravelOptionCard({ option, onSelect }: TravelOptionCardProps) {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'flight':
        return { icon: 'fas fa-plane', color: 'text-primary bg-primary/10' };
      case 'train':
        return { icon: 'fas fa-train', color: 'text-green-600 bg-green-100' };
      case 'bus':
        return { icon: 'fas fa-bus', color: 'text-orange-600 bg-orange-100' };
      default:
        return { icon: 'fas fa-map-marker-alt', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getOperatorName = () => {
    if (option.airline) return option.airline;
    if (option.trainOperator) return option.trainOperator;
    if (option.busOperator) return option.busOperator;
    return 'Unknown';
  };

  const { icon, color } = getIconAndColor(option.type);

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`travel-option-${option.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
              <i className={icon}></i>
            </div>
            <div>
              <h3 className="font-semibold text-lg capitalize" data-testid={`option-type-${option.id}`}>
                {option.type}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`option-operator-${option.id}`}>
                {getOperatorName()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground" data-testid={`option-price-${option.id}`}>
              ${option.price}
            </div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <i className="fas fa-clock text-muted-foreground"></i>
            <div>
              <div className="font-medium" data-testid={`option-departure-${option.id}`}>
                {option.departureTime}
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`option-source-${option.id}`}>
                {option.source}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground" data-testid={`option-duration-${option.id}`}>
                {option.duration}
              </div>
              <div className="border-t border-border my-1"></div>
              <div className="text-xs text-muted-foreground">Direct</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 justify-end">
            <div className="text-right">
              <div className="font-medium" data-testid={`option-arrival-${option.id}`}>
                {option.arrivalTime}
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`option-destination-${option.id}`}>
                {option.destination}
              </div>
            </div>
            <i className={`${icon} text-muted-foreground`}></i>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid={`option-seats-${option.id}`}>
              {option.availableSeats} seats left
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Free cancellation</span>
          </div>
          <Button 
            onClick={onSelect}
            data-testid={`select-option-${option.id}`}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
