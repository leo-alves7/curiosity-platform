import { useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonContent, IonFab, IonFabButton, IonIcon, IonModal, IonPage } from '@ionic/react'
import { listOutline } from 'ionicons/icons'
import maplibregl from 'maplibre-gl'
import AppHeader from '@/components/Layout/AppHeader'
import MapView from '@/components/MapView'
import StoreListPanel from '@/components/StoreList/StoreListPanel'
import { StoreDetailView } from '@/components/StoreDetail'
import LocateMeFab from '@/components/MapView/LocateMeFab'
import { AddStoreButton, AddStoreModal } from '@/components/AddStore'
import { usePinDrop } from '@/components/AddStore/usePinDrop'
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
import {
  selectIsPanelOpen,
  togglePanel,
  setPanelOpen,
  selectIsAddingStore,
  selectPinLocation,
  setPinLocation,
  resetAddStore,
} from '@/slices/uiSlice'
import { selectUserLocation, selectFollowingUser, setFollowingUser } from '@/slices/locationSlice'
import { useIsMobile } from '@/components/AppTabs/useIsMobile'
import { TAB_BAR_HEIGHT } from '@/components/AppTabs/AppTabs'
import type { StoreResponse } from '@/types/store'
import type { AppDispatch } from '@/store'

function MapPage() {
  const dispatch = useDispatch<AppDispatch>()
  const markerActionsRef = useRef<MarkerActions | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)
  const isMobile = useIsMobile()
  const isPanelOpen = useSelector(selectIsPanelOpen)
  const userLocation = useSelector(selectUserLocation)
  const isFollowingUser = useSelector(selectFollowingUser)
  const isAddingStore = useSelector(selectIsAddingStore)
  const pinLocation = useSelector(selectPinLocation)

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

  const handleMapReady = useCallback((map: maplibregl.Map | null) => {
    setMapInstance(map)
  }, [])

  const handlePinDropped = useCallback(
    (lat: number, lng: number) => {
      dispatch(setPinLocation({ lat, lng }))
    },
    [dispatch],
  )

  usePinDrop(mapInstance, isAddingStore && pinLocation === null, handlePinDropped)

  const handleAddStoreModalClose = useCallback(() => {
    dispatch(resetAddStore())
  }, [dispatch])

  const handleStoreCreated = useCallback((store: StoreResponse) => {
    if (store.lat == null || store.lng == null) return
    setSelectedStoreId(store.id)
  }, [])

  const handleViewDetails = useCallback((storeId: string) => {
    setSelectedStoreId(storeId)
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

  const handleTogglePanel = useCallback(() => {
    dispatch(togglePanel())
  }, [dispatch])

  const handlePanelDismiss = useCallback(() => {
    dispatch(setPanelOpen(false))
  }, [dispatch])

  const handleLocateToggle = useCallback(
    (active: boolean) => {
      dispatch(setFollowingUser(active))
    },
    [dispatch],
  )

  if (isMobile) {
    return (
      <IonPage>
        <AppHeader />
        <IonContent scrollY={false} style={{ '--padding-bottom': `${TAB_BAR_HEIGHT}px` }}>
          <div style={{ width: '100%', height: '100%' }}>
            <MapView
              onMarkerActionsReady={handleMarkerActionsReady}
              onMapReady={handleMapReady}
              onViewDetails={handleViewDetails}
              showLocateFab={false}
            />
          </div>
          <IonModal
            isOpen={isPanelOpen}
            onDidDismiss={handlePanelDismiss}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 1]}
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
              onStoreClick={handleViewDetails}
              isMobile={isMobile}
            />
          </IonModal>
          <IonModal isOpen={selectedStoreId !== null} onDidDismiss={() => setSelectedStoreId(null)}>
            {selectedStoreId !== null && (
              <StoreDetailView
                storeId={selectedStoreId}
                categoryMap={categoryMap}
                onClose={() => setSelectedStoreId(null)}
              />
            )}
          </IonModal>
        </IonContent>
        <LocateMeFab
          userLocation={userLocation}
          isFollowingUser={isFollowingUser}
          onToggleFollow={handleLocateToggle}
          bottomOffset={TAB_BAR_HEIGHT}
        />
        <IonFab
          style={{
            position: 'absolute',
            bottom: `${TAB_BAR_HEIGHT + 16 + 56 + 8}px`,
            right: '16px',
          }}
        >
          <IonFabButton onClick={handleTogglePanel} aria-label="Toggle store list">
            <IonIcon icon={listOutline} />
          </IonFabButton>
        </IonFab>
        <AddStoreButton bottomOffset={TAB_BAR_HEIGHT + 16 + 56 + 8 + 56 + 8} />
        <AddStoreModal
          isOpen={isAddingStore && pinLocation !== null}
          pinLocation={pinLocation}
          onClose={handleAddStoreModalClose}
          onStoreCreated={handleStoreCreated}
        />
      </IonPage>
    )
  }

  return (
    <IonPage>
      <AppHeader />
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
              onStoreClick={handleViewDetails}
              isMobile={false}
            />
          </div>
          <div style={{ height: '100%' }}>
            <MapView
              onMarkerActionsReady={handleMarkerActionsReady}
              onMapReady={handleMapReady}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
        <IonModal isOpen={selectedStoreId !== null} onDidDismiss={() => setSelectedStoreId(null)}>
          {selectedStoreId !== null && (
            <StoreDetailView
              storeId={selectedStoreId}
              categoryMap={categoryMap}
              onClose={() => setSelectedStoreId(null)}
            />
          )}
        </IonModal>
        <AddStoreButton />
        <AddStoreModal
          isOpen={isAddingStore && pinLocation !== null}
          pinLocation={pinLocation}
          onClose={handleAddStoreModalClose}
          onStoreCreated={handleStoreCreated}
        />
      </IonContent>
    </IonPage>
  )
}

export default MapPage
