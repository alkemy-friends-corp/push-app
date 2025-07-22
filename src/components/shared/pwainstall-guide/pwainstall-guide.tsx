import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Smartphone, Plus } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export function PWAInstallGuide() {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddToHomeScreen = () => {
    // In a real PWA, this would trigger the browser's install prompt
    alert("Please use your browser's 'Add to Home Screen' option to install Toyosu Spots!");
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <CardTitle>{t('pwa.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('pwa.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleAddToHomeScreen}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pwa.button')}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? t('pwa.guide.hide') : t('pwa.guide.show')}
        </Button>
        
        {isExpanded && (
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium mb-2">{t('pwa.guide.iphone')}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{t('pwa.guide.iphone.step1')}</li>
                <li>{t('pwa.guide.iphone.step2')}</li>
                <li>{t('pwa.guide.iphone.step3')}</li>
              </ol>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium mb-2">{t('pwa.guide.android')}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{t('pwa.guide.android.step1')}</li>
                <li>{t('pwa.guide.android.step2')}</li>
                <li>{t('pwa.guide.android.step3')}</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}