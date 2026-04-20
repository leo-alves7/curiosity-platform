import { useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonContent, IonPage } from '@ionic/react'
import MapView from '@/components/MapView'
import StoreListPanel from '@/components/StoreList/StoreListPanel'
import type { MarkerActions } from '@/components/MapView/useMapMarkers'
import {
  selectCategories,
  selectCategoryMap,
  selectFilteredStores,
  selectPage,
  selectPageSize,
  selectSearchQuery,
  selectSelectedCategory,
  selectStoresError,
  selectStoresStatus,
  setPage,
  setSearchQuery,
  setSelectedCategory,
} from '@/slices/storesSlice'
import type { AppDispatch } from '@/store'

function MapPage() {
  const dispatch = useDispatch<AppDispatch>()
  const markerActionsRef = useRef<MarkerActions | null>(null)

  const filteredStores = useSelector(selectFilteredStores)
  const categories = useSelector(selectCategories)
  const categoryMap = useSelector(selectCategoryMap)
  const status = useSelector(selectStoresStatus)
  const error = useSelector(selectStoresError)
  const searchQuery = useSelector(selectSearchQuery)
  const selectedCategoryId = useSelector(selectSelectedCategory)
  const page = useSelector(selectPage)
  const pageSize = useSelector(selectPageSize)

  const paginatedStores = filteredStores.slice(0, page * pageSize)
  const canLoadMore = paginatedStores.length < filteredStores.length

  const handleMarkerActionsReady = useCallback((actions: MarkerActions) => {
    markerActionsRef.current = actions
  }, [])

  const handleStoreClick = useCallback((storeId: string) => {
    markerActionsRef.current?.panToMarker(storeId)
    markerActionsRef.current?.openMarkerPopup(storeId)
  }, [])

  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query))
    },
    [dispatch],
  )

  const handleCategoryChange = useCallback(
    (categoryId: string | null) => {
      dispatch(setSelectedCategory(categoryId))
    },
    [dispatch],
  )

  const handleLoadMore = useCallback(() => {
    dispatch(setPage(page + 1))
  }, [dispatch, page])

  return (
    <IonPage>
      <IonContent>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '35fr 65fr',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRight: '1px solid var(--ion-color-light-shade, #d7d8da)',
              overflow: 'hidden',
            }}
          >
            <StoreListPanel
              filteredStores={paginatedStores}
              categories={categories}
              categoryMap={categoryMap}
              status={status}
              error={error}
              searchQuery={searchQuery}
              selectedCategoryId={selectedCategoryId}
              hasMore={canLoadMore}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
              onLoadMore={handleLoadMore}
              onStoreClick={handleStoreClick}
            />
          </div>
          <div style={{ height: '100%' }}>
            <MapView
              onMarkerActionsReady={handleMarkerActionsReady}
              onViewDetails={handleStoreClick}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MapPage
