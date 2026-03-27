export interface Unit {
  id: number;
  name: string;
  max_guests: number;
  pricing_model: 'per_unit' | 'per_person';
  price: number;
  available_count: number;
  pictures: string[];
}

export interface Property {
  id: number;
  name: string;
  currency: string;
  tax_rate: number;
  pictures: string[];
}

export interface PropertyData {
  property: Property;
  units: Unit[];
}
