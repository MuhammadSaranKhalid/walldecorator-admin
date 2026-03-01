import { categories } from "@/generated/prisma";

type Category = categories;

export interface CategoryTree extends Category {
    children: CategoryTree[];
    level: number;
    path: string[]; // Array of category names from root to current
}

/**
 * Build a hierarchical tree structure from flat category array
 */
export function buildCategoryTree(
    categories: Category[],
    parentId: string | null = null,
    level: number = 0,
    path: string[] = []
): CategoryTree[] {
    return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
            ...cat,
            level,
            path: [...path, cat.name],
            children: buildCategoryTree(categories, cat.id, level + 1, [...path, cat.name]),
        }))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

/**
 * Flatten tree structure for rendering
 */
export function flattenCategoryTree(
    nodes: CategoryTree[],
    expandedIds: Set<string>
): CategoryTree[] {
    return nodes.reduce<CategoryTree[]>((acc, node) => {
        acc.push(node);
        if (expandedIds.has(node.id) && node.children.length > 0) {
            acc.push(...flattenCategoryTree(node.children, expandedIds));
        }
        return acc;
    }, []);
}

/**
 * Get all descendant IDs of a category (children, grandchildren, etc.)
 */
export function getDescendantIds(
    categoryId: string,
    categories: Category[]
): string[] {
    const descendants: string[] = [];

    const findChildren = (parentId: string) => {
        const children = categories.filter(cat => cat.parent_id === parentId);
        children.forEach(child => {
            descendants.push(child.id);
            findChildren(child.id); // Recursive call
        });
    };

    findChildren(categoryId);
    return descendants;
}

/**
 * Get all ancestor IDs of a category (parent, grandparent, etc.)
 */
export function getAncestorIds(
    categoryId: string,
    categories: Category[]
): string[] {
    const ancestors: string[] = [];

    const findParent = (childId: string) => {
        const category = categories.find(cat => cat.id === childId);
        if (category?.parent_id) {
            ancestors.push(category.parent_id);
            findParent(category.parent_id); // Recursive call
        }
    };

    findParent(categoryId);
    return ancestors;
}

/**
 * Check if setting parentId would create a circular reference
 * Returns true if circular reference would be created
 */
export function wouldCreateCircularReference(
    categoryId: string,
    proposedParentId: string | null,
    categories: Category[]
): boolean {
    if (!proposedParentId || categoryId === proposedParentId) {
        return true; // Self-parenting
    }

    // Get all descendants of current category
    const descendants = getDescendantIds(categoryId, categories);

    // If proposed parent is a descendant, it would create a circular reference
    return descendants.includes(proposedParentId);
}

/**
 * Get the depth/level of a category in the hierarchy
 */
export function getCategoryDepth(
    categoryId: string,
    categories: Category[]
): number {
    const ancestors = getAncestorIds(categoryId, categories);
    return ancestors.length;
}

/**
 * Get maximum depth in the category tree
 */
export function getMaxDepth(categories: Category[]): number {
    let maxDepth = 0;

    categories.forEach(cat => {
        const depth = getCategoryDepth(cat.id, categories);
        if (depth > maxDepth) {
            maxDepth = depth;
        }
    });

    return maxDepth;
}

/**
 * Get category breadcrumb path (name trail from root to category)
 */
export function getCategoryBreadcrumb(
    categoryId: string,
    categories: Category[]
): string {
    const path: string[] = [];

    const buildPath = (id: string) => {
        const category = categories.find(cat => cat.id === id);
        if (category) {
            path.unshift(category.name);
            if (category.parent_id) {
                buildPath(category.parent_id);
            }
        }
    };

    buildPath(categoryId);
    return path.join(' > ');
}

/**
 * Get formatted category options for select dropdown with hierarchy indicators
 */
export function getCategoryOptionsWithHierarchy(
    categories: Category[],
    excludeId?: string
): Array<{ value: string; label: string; level: number; disabled?: boolean }> {
    const tree = buildCategoryTree(categories);
    const options: Array<{ value: string; label: string; level: number; disabled?: boolean }> = [];

    const flatten = (nodes: CategoryTree[]) => {
        nodes.forEach(node => {
            if (node.id !== excludeId) {
                const descendants = excludeId ? getDescendantIds(excludeId, categories) : [];
                options.push({
                    value: node.id,
                    label: '—'.repeat(node.level) + (node.level > 0 ? ' ' : '') + node.name,
                    level: node.level,
                    disabled: descendants.includes(node.id), // Disable descendants to prevent circular refs
                });
            }
            if (node.children.length > 0) {
                flatten(node.children);
            }
        });
    };

    flatten(tree);
    return options;
}

/**
 * Validate category structure
 */
export function validateCategoryStructure(
    categoryId: string | undefined,
    parentId: string | null,
    categories: Category[],
    maxDepth: number = 5
): { valid: boolean; error?: string } {
    // Check circular reference
    if (categoryId && parentId) {
        if (wouldCreateCircularReference(categoryId, parentId, categories)) {
            return {
                valid: false,
                error: "Cannot set a category's descendant as its parent (circular reference)"
            };
        }
    }

    // Check max depth
    if (parentId) {
        const parentDepth = getCategoryDepth(parentId, categories);
        if (parentDepth >= maxDepth) {
            return {
                valid: false,
                error: `Maximum nesting depth (${maxDepth} levels) would be exceeded`
            };
        }
    }

    return { valid: true };
}

/**
 * Collect all IDs in a tree (for expand all functionality)
 */
export function collectAllParentIds(tree: CategoryTree[]): Set<string> {
    const ids = new Set<string>();

    const collect = (nodes: CategoryTree[]) => {
        nodes.forEach(node => {
            if (node.children.length > 0) {
                ids.add(node.id);
                collect(node.children);
            }
        });
    };

    collect(tree);
    return ids;
}
