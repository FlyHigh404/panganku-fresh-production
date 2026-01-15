export interface Product {
  category: string;
  id: string | number;
  image?: string;
  name: string;
  weight?: string;
  stock?: string | number;
  description?: string;
  price: string | number;
}
