import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonContent, IonModal } from '@ionic/react'
import StoreListPanel from '@/components/StoreList/StoreListPanel'
import { TAB_BAR_HEIGHT } from '@/components/AppTabs/AppTabs'
import { StoreDetailView } from '@/components/StoreDetail'
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

function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)

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

  return (
    <div className="ion-page">
      <IonContent style={{ '--padding-bottom': `${TAB_BAR_HEIGHT}px` }}>
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
        />
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
    </div>
  )
}

export default ExplorePage
