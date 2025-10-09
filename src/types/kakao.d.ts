// Kakao Maps JavaScript SDK Type Definitions

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow
        event: {
          addListener: (
            target: KakaoMarker | KakaoMap,
            type: string,
            callback: () => void
          ) => void
        }
      }
    }
  }

  interface KakaoLatLng {
    getLat: () => number
    getLng: () => number
  }

  interface KakaoMapOptions {
    center: KakaoLatLng
    level: number
  }

  interface KakaoMap {
    setCenter: (latlng: KakaoLatLng) => void
    getCenter: () => KakaoLatLng
    setLevel: (level: number) => void
    getLevel: () => number
  }

  interface KakaoMarkerOptions {
    position: KakaoLatLng
    map?: KakaoMap
  }

  interface KakaoMarker {
    setMap: (map: KakaoMap | null) => void
    getPosition: () => KakaoLatLng
  }

  interface KakaoInfoWindowOptions {
    content: string
    removable?: boolean
  }

  interface KakaoInfoWindow {
    open: (map: KakaoMap, marker: KakaoMarker) => void
    close: () => void
  }
}

export {}
