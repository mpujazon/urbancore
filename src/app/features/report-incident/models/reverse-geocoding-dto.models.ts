export interface ReverseGeocodingDto{
  lat: number;
  lng: number;
  addressLabel: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  country: string;
  countryCode: string;
  suburb: string;
  provider: string;
}
