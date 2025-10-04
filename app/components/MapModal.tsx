'use client';
import { useState, useEffect } from 'react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  city?: string;
  department?: string;
}

export default function MapModal({ isOpen, onClose, address, city, department }: MapModalProps) {
  const [mapType, setMapType] = useState<'google' | 'openstreet'>('openstreet');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);

  // Construir dirección completa
  const fullAddress = [address, city, department].filter(Boolean).join(', ');
  
  // URL para Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  
  // URL para OpenStreetMap
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`;

  // Geocodificación mejorada con validación de precisión
  useEffect(() => {
    if (isOpen && fullAddress) {
      setLoading(true);
      const geocodeAddress = async () => {
        try {
          let foundCoordinates = null;
          
          // Estrategia 1: Búsqueda completa con país
          let response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=pe&addressdetails=1`
          );
          let data = await response.json();
          
          // Estrategia 2: Si no encuentra, buscar solo ciudad + departamento
          if (!data || data.length === 0) {
            const cityDept = [city, department].filter(Boolean).join(', ');
            if (cityDept) {
              response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityDept + ', Peru')}&limit=1&countrycodes=pe`
              );
              data = await response.json();
            }
          }
          
          // Estrategia 3: Si no encuentra, buscar solo ciudad
          if (!data || data.length === 0 && city) {
            response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', Peru')}&limit=1&countrycodes=pe`
            );
            data = await response.json();
          }
          
          // Estrategia 4: Si no encuentra, buscar sin restricción de país
          if (!data || data.length === 0) {
            response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
            );
            data = await response.json();
          }
          
          if (data && data.length > 0) {
            foundCoordinates = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
          
          // Validar si las coordenadas parecen correctas para Lima, Perú
          // Lima está aproximadamente entre -12.2 a -11.8 lat y -77.2 a -76.7 lng
          if (foundCoordinates) {
            const isInLima = foundCoordinates.lat >= -12.2 && foundCoordinates.lat <= -11.8 && 
                           foundCoordinates.lng >= -77.2 && foundCoordinates.lng <= -76.7;
            
            if (isInLima) {
              setCoordinates(foundCoordinates);
            } else {
              // Si las coordenadas no parecen estar en Lima, no las usamos
              console.log('Coordenadas fuera del rango de Lima, no se mostrarán');
            }
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        } finally {
          setLoading(false);
        }
      };
      
      geocodeAddress();
    }
  }, [isOpen, fullAddress, city, department]);

  const handleOpenInMaps = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

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
              {loading ? (
                <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Buscando ubicación...</p>
                  </div>
                </div>
              ) : coordinates ? (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01},${coordinates.lat-0.01},${coordinates.lng+0.01},${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  title={`Mapa de ${fullAddress}`}
                />
              ) : (
                <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Ver ubicación en Google Maps</h3>
                    <p className="text-gray-600 mb-4">
                      Para obtener la ubicación más precisa, usa Google Maps que tiene datos más actualizados
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <p className="text-sm text-gray-600">
                        <strong>📍 Dirección:</strong><br />
                        {fullAddress}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleOpenInMaps(googleMapsUrl)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium mr-3 text-lg"
                      >
                        🗺️ Ver en Google Maps
                      </button>
                      <button
                        onClick={() => handleOpenInMaps(openStreetMapUrl)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        🌍 OpenStreetMap
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      💡 Google Maps tiene la ubicación más precisa para esta dirección
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mt-2">
              <strong>📍 Dirección completa:</strong> {fullAddress}
              {coordinates && (
                <span className="ml-2 text-blue-600">
                  • Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </span>
              )}
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
