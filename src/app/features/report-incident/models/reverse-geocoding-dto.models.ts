export interface ReverseGeocodingDto{
  lat: number;
  lng: number;
  addressLabel: string;
  addressLine1: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  citySlug: string;
  country: string;
  countryCode: string;
  suburb: string;
  provider: string;
}
