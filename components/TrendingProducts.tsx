import { Section } from '@/components/Section'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/api'

const trendingProducts: Product[] = [
  {
    _id: '3',
    name: 'Roadster T-Shirt',
    image: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24219990/2023/7/27/710b0ded-05f9-4a8d-8971-df505537f83e1690436621869RARERABBITMenNavyBlueSlimFitTrousers5.jpg',
    url: '',
    domain: 'myntra.com',
    currency: '₹',
    availability: 'In Stock',
    currentPrice: 499,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Nike Sneakers',
    image: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24219990/2023/7/27/710b0ded-05f9-4a8d-8971-df505537f83e1690436621869RARERABBITMenNavyBlueSlimFitTrousers5.jpg',
    url: '',
    domain: 'myntra.com',
    currency: '₹',
    availability: 'In Stock',
    currentPrice: 4999,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Levis Jeans',
    image: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24219990/2023/7/27/710b0ded-05f9-4a8d-8971-df505537f83e1690436621869RARERABBITMenNavyBlueSlimFitTrousers5.jpg',
    url: '',
    domain: 'myntra.com',
    currency: '₹',
    availability: 'In Stock',
    currentPrice: 2499,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function TrendingProducts() {
  return (
    <Section>
      <h2 className="text-3xl font-bold text-center mb-10">Trending Products</h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {trendingProducts.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </Section>
  )
}
