'use client';
import { useState } from 'react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  city?: string;
  department?: string;
}

export default function MapModal({ isOpen, onClose, address, city, department }: MapModalProps) {
  const [mapType, setMapType] = useState<'google' | 'openstreet'>('google');

  if (!isOpen) return null;

  // Construir dirección completa
  const fullAddress = [address, city, department].filter(Boolean).join(', ');
  
  // URL para Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  
  // URL para OpenStreetMap
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`;

  const handleOpenInMaps = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">📍 Ubicación del Propietario</h2>
              <p className="text-blue-100 text-sm mt-1">{fullAddress}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Map Type Selector */}
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMapType('google')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mapType === 'google'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗺️ Google Maps
              </button>
              <button
                onClick={() => setMapType('openstreet')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mapType === 'openstreet'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🌍 OpenStreetMap
              </button>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
              {mapType === 'google' ? (
                <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Google Maps</h3>
                    <p className="text-gray-600 mb-4">
                      Haz clic en el botón de abajo para abrir la ubicación en Google Maps
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <p className="text-sm text-gray-600">
                        <strong>📍 Ubicación:</strong><br />
                        {fullAddress}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">OpenStreetMap</h3>
                    <p className="text-gray-600 mb-4">
                      Haz clic en el botón de abajo para abrir la ubicación en OpenStreetMap
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <p className="text-sm text-gray-600">
                        <strong>📍 Ubicación:</strong><br />
                        {fullAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mt-2">
              <strong>📍 Dirección completa:</strong> {fullAddress}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleOpenInMaps(googleMapsUrl)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              🗺️ Abrir en Google Maps
            </button>
            <button
              onClick={() => handleOpenInMaps(openStreetMapUrl)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
            >
              🌍 Abrir en OpenStreetMap
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Información</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Google Maps: Navegación detallada y direcciones paso a paso</li>
              <li>• OpenStreetMap: Mapa abierto y colaborativo</li>
              <li>• Ambas opciones se abrirán en una nueva pestaña</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
