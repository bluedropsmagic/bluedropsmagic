import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock } from 'lucide-react';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

interface DownsellContent {
  warning: string;
  headline: string;
  subheadline: string;
  description: string[];
  finalOffer: {
    title: string;
    content: string[];
  };
  acceptUrl: string;
  rejectUrl: string;
  productImage: string;
  savings: string;
  originalPrice: string;
  newPrice: string;
  installments: string;
  bottlesOffered: string;
}

export const DownsellPage: React.FC<DownsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');

  // Preserve CartPanda parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Common CartPanda parameters to preserve
    const cartPandaParams = [
      'order_id', 'customer_id', 'transaction_id', 'email', 'phone',
      'first_name', 'last_name', 'address', 'city', 'state', 'zip',
      'country', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
      'utm_content', 'fbclid', 'gclid', 'affiliate_id', 'sub_id'
    ];

    cartPandaParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params.append(param, value);
      }
    });

    // Also preserve any other parameters that might be present
    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  const getDownsellContent = (variant: string): DownsellContent => {
    const contents = {
      'dws1': {
        warning: '⚠️ WAIT!',
        headline: 'Don\'t Miss This Final Offer',
        subheadline: 'Before you go, we have one last chance to help you succeed...',
        description: [
          'We understand that the full 9-month supply might seem like a big commitment.',
          'But we can\'t let you leave without giving you at least a fighting chance.',
          'That\'s why we\'re offering you a special downsell - just enough to see real results.'
        ],
        finalOffer: {
          title: '🎯 Final Offer: 3-Month Supply',
          content: [
            'Get 3 bottles at our lowest price ever',
            'Enough time to see significant improvements',
            'Still covered by our 180-day guarantee',
            'Free shipping included'
          ]
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=no',
        productImage: 'https://i.imgur.com/eXYnjhm.png',
        savings: 'SAVE $200',
        originalPrice: 'R$ 297,00',
        newPrice: 'R$ 97,00',
        installments: '12x R$ 8,08',
        bottlesOffered: '3 BOTTLES'
      },
      'dws2': {
        warning: '⚠️ LAST CHANCE:',
        headline: 'Special Discount Inside',
        subheadline: 'This is truly your final opportunity to get BlueDrops at a discount...',
        description: [
          'We\'ve already given you our best offers.',
          'But we believe so strongly in BlueDrops that we\'re willing to make one final exception.',
          'This is the absolute lowest price we can offer - and it\'s only available right now.'
        ],
        finalOffer: {
          title: '💥 Absolute Final Offer: 2-Month Supply',
          content: [
            'Get 2 bottles at an incredible discount',
            'Perfect for testing the waters',
            'Full money-back guarantee',
            'No additional shipping costs'
          ]
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no',
        productImage: 'https://i.imgur.com/eXYnjhm.png',
        savings: 'SAVE $150',
        originalPrice: 'R$ 198,00',
        newPrice: 'R$ 67,00',
        installments: '12x R$ 5,58',
        bottlesOffered: '2 BOTTLES'
      },
      'dw3': {
        warning: '⚠️ FINAL OPPORTUNITY:',
        headline: 'Exclusive Deal',
        subheadline: 'This is it - the very last chance to get BlueDrops at any discount...',
        description: [
          'We\'ve exhausted all our special offers.',
          'But we can\'t bear to see you leave empty-handed.',
          'So here\'s our final, final offer - one single bottle at a special price.'
        ],
        finalOffer: {
          title: '🔥 Rock Bottom Price: 1 Bottle',
          content: [
            'Single bottle at our lowest price ever',
            'Try BlueDrops risk-free',
            'Full 180-day money-back guarantee',
            'Minimal investment, maximum potential'
          ]
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no',
        productImage: 'https://i.imgur.com/iWs7wy7.png',
        savings: 'SAVE $50',
        originalPrice: 'R$ 99,00',
        newPrice: 'R$ 49,00',
        installments: '12x R$ 4,08',
        bottlesOffered: '1 BOTTLE'
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const content = getDownsellContent(variant);

  const handleAccept = () => {
    trackOfferClick(`downsell-${variant}-accept`);
    
    // ✅ NEW: Add CID parameter if present
    let url = cartParams ? `${content.acceptUrl}&${cartParams}` : content.acceptUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    window.location.href = url;
  };

  const handleReject = () => {
    trackOfferClick(`downsell-${variant}-reject`);
    
    // ✅ NEW: Add CID parameter if present
    let url = cartParams ? `${content.rejectUrl}&${cartParams}` : content.rejectUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Orange Banner */}
      <div className="bg-orange-600 text-white text-center py-3 px-4">
        <h1 className="text-lg sm:text-xl font-bold tracking-wide">
          OFERTA ESPECIAL - ÚLTIMA CHANCE
        </h1>
      </div>

      {/* Blue Section */}
      <div className="bg-blue-500 text-center py-4 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          NÃO VAMOS DESISTIR DE VOCÊ...
        </h2>
        <p className="text-white text-sm sm:text-base max-w-4xl mx-auto leading-relaxed">
          ESTA É VERDADEIRAMENTE SUA ÚLTIMA OPORTUNIDADE DE CONSEGUIR O BLUEDROPS 
          COM DESCONTO ESPECIAL!
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Product Image */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Blue background with discount */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ÚLTIMA CHANCE
                </div>
                
                {/* Product Image */}
                <div className="flex justify-center mb-6">
                  <img 
                    src={content.productImage}
                    alt="BlueDrops Downsell Package"
                    className="w-48 h-auto object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Price Badge */}
                <div className="text-center">
                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg inline-block mb-2">
                    <span className="text-sm">de </span>
                    <span className="line-through text-lg">{content.originalPrice}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-white text-sm">POR APENAS </span>
                    <span className="text-yellow-300 text-4xl font-bold">
                      {content.newPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Offer Details */}
          <div className="space-y-6">
            
            {/* Discount Box */}
            <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {content.warning}
              </h3>
              <div className="text-2xl font-bold text-gray-800 mb-4">
                {content.headline}
              </div>
              
              <div className="bg-orange-500 text-white px-4 py-2 rounded-lg inline-block mb-4">
                <span className="text-lg font-bold">
                  {content.bottlesOffered} COM {content.savings}
                </span>
              </div>

              <div className="text-gray-700 mb-4">
                <div className="text-lg">
                  De <span className="line-through text-red-600">{content.originalPrice}</span> por apenas
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {content.installments}
                </div>
                <div className="text-gray-600">
                  ou, {content.newPrice} à vista
                </div>
              </div>

              {/* Accept Button */}
              <button
                onClick={handleAccept}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors mb-4 border-2 border-gray-400"
              >
                SIM, EU ACEITO ESTA OFERTA FINAL
              </button>
            </div>

            {/* Warning Message */}
            <div className="text-center">
              <p className="text-red-600 font-semibold text-sm">
                <span className="font-bold">Atenção:</span> Esta é realmente a última oportunidade. 
                Após esta página, não haverá mais ofertas disponíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-3">
                  {content.warning} {content.headline}
                </h3>
                <p className="text-orange-700 mb-4">
                  {content.subheadline}
                </p>
                
                <div className="space-y-2 mb-6">
                  {content.description.map((desc, index) => (
                    <p key={index} className="text-orange-700">
                      {desc}
                    </p>
                  ))}
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-orange-800 mb-3">
                    {content.finalOffer.title}
                  </h4>
                  <div className="space-y-1">
                    {content.finalOffer.content.map((item, index) => (
                      <div key={index} className="flex items-center text-orange-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 max-w-2xl mx-auto space-y-4">
          <button
            onClick={handleAccept}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors border-2 border-gray-400"
          >
            🟨 YES — I ACCEPT THIS FINAL OFFER
          </button>
          
          <button
            onClick={handleReject}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300"
          >
            ❌ No thanks — I'll pass on this opportunity
          </button>
        </div>

        {/* Benefits Icons */}
        <div className="mt-8 flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">180-Day Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">Final Opportunity</span>
          </div>
        </div>
      </div>
    </div>
  );
};