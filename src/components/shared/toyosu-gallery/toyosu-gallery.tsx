import { Card, CardContent } from "../../ui/card";
import { ImageWithFallback } from "../figma/image-with-fallback/image-with-fallback";

export function ToyosuGallery() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80",
      alt: "Tokyo Tower view from Toyosu"
    },
    {
      src: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&q=80",
      alt: "Toyosu fish market"
    },
    {
      src: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400&q=80",
      alt: "Toyosu waterfront"
    },
    {
      src: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=80",
      alt: "Modern architecture in Toyosu"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {images.map((image, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="w-full h-24 object-cover"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}