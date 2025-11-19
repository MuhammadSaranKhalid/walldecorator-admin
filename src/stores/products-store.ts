import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Material {
  id: string;
  name: string;
  slug: string;
}

interface ProductMaterial {
  id: string;
  material_id: string;
  price: number;
  inventory_quantity: number;
  materials?: Material;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  primary_image_url: string;
  status: "active" | "inactive" | "archived" | "draft";
  product_materials?: ProductMaterial[];
}

interface ProductsState {
  // Filters
  selectedMaterials: string[];
  priceRange: [number, number];
  sortBy: string;
  
  // Pagination & Products
  currentPage: number;
  allLoadedProducts: Product[];
  hasMore: boolean;
  
  // Actions
  setSelectedMaterials: (materials: string[]) => void;
  toggleMaterial: (materialId: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sortBy: string) => void;
  setCurrentPage: (page: number) => void;
  setAllLoadedProducts: (products: Product[]) => void;
  appendProducts: (products: Product[]) => void;
  setHasMore: (hasMore: boolean) => void;
  clearFilters: () => void;
  resetState: () => void;
}

const initialState = {
  selectedMaterials: [],
  priceRange: [0, 1000] as [number, number],
  sortBy: "popularity",
  currentPage: 1,
  allLoadedProducts: [],
  hasMore: true,
};

/**
 * Global Products Page State Store
 * 
 * This store manages the state for the products listing page, including:
 * - Filters (materials, price range, sort order) - persisted in localStorage
 * - Loaded products and pagination state - kept in memory only
 * 
 * Benefits:
 * - Filters persist across page navigation and browser refresh
 * - Products state persists during navigation (prevents "No products found" flash)
 * - Improves UX by maintaining user's filter preferences
 */
export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedMaterials: (materials) =>
        set({ selectedMaterials: materials }),

      toggleMaterial: (materialId) =>
        set((state) => ({
          selectedMaterials: state.selectedMaterials.includes(materialId)
            ? state.selectedMaterials.filter((m) => m !== materialId)
            : [...state.selectedMaterials, materialId],
        })),

      setPriceRange: (range) => set({ priceRange: range }),

      setSortBy: (sortBy) => set({ sortBy }),

      setCurrentPage: (page) => set({ currentPage: page }),

      setAllLoadedProducts: (products) =>
        set({ allLoadedProducts: products }),

      appendProducts: (products) =>
        set((state) => {
          const existingIds = new Set(
            state.allLoadedProducts.map((p) => String(p.id))
          );
          const newProducts = products.filter(
            (p) => !existingIds.has(String(p.id))
          );
          return {
            allLoadedProducts: [...state.allLoadedProducts, ...newProducts],
          };
        }),

      setHasMore: (hasMore) => set({ hasMore }),

      clearFilters: () =>
        set({
          selectedMaterials: [],
          priceRange: [0, 1000], // Default - components may override with dynamic max
        }),

      resetState: () => set(initialState),
    }),
    {
      name: "products-storage",
      // Only persist filters, not the products themselves
      partialize: (state) => ({
        selectedMaterials: state.selectedMaterials,
        priceRange: state.priceRange,
        sortBy: state.sortBy,
      }),
    }
  )
);

