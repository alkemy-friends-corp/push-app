import { Card, CardContent } from "../../ui/card";
import { useLanguage } from "../../../contexts/LanguageContext";
// Using placeholder image for demo - replace with actual image file
const newCoupleImage = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';

export function ServiceExplanation() {
  const { t } = useLanguage();

  return (
    <Card className="border-0 bg-white shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="relative min-h-[780px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${newCoupleImage})` }}
        >
          {/* Text Content positioned in the sky area */}
          <div className="relative z-10 px-6 pt-8 pb-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold mb-4 leading-tight text-gray-900">
                  {t('service.title')}
                </h2>
                <p className="text-gray-800 mb-6 leading-relaxed">
                  {t('service.subtitle')}
                </p>
              </div>
              
              {/* Description paragraphs */}
              <div className="space-y-4">
                <p className="text-gray-800 leading-relaxed">
                  <span className="font-semibold text-gray-900">
                    {t('service.notification.title')}
                  </span>
                  {t('service.notification.description')}
                </p>
                
                <p className="text-gray-800 leading-relaxed">
                  {t('service.conclusion')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}