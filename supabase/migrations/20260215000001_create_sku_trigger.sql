-- Migration: 20260215000001_create_sku_trigger
-- Description: Creates a trigger to automatically generate SKUs for new products.

CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS TRIGGER AS $$
DECLARE
    v_category_code TEXT;
    v_product_code TEXT;
    v_sequence INT;
    v_sku_pattern TEXT;
    v_last_sku TEXT;
    v_category_name TEXT;
BEGIN
    -- If SKU is already provided, do not overwrite it
    IF NEW.sku IS NOT NULL AND NEW.sku != '' THEN
        RETURN NEW;
    END IF;

    -- 1. Get Category Code
    v_category_code := 'GEN'; -- Default if no category or not found
    
    IF NEW.category_id IS NOT NULL THEN
        SELECT name INTO v_category_name FROM categories WHERE id = NEW.category_id;
        
        IF v_category_name IS NOT NULL THEN
            -- Upper case, remove non-letters, take first 4 chars
            v_category_code := SUBSTRING(REGEXP_REPLACE(UPPER(v_category_name), '[^A-Z]', '', 'g'), 1, 4);
            
            -- If less than 3 chars, pad with X (though originally it was padEnd(3, 'X') but logic said < 3)
            -- The original logic: if length < 3, use alphanumeric and pad.
            IF LENGTH(v_category_code) < 3 THEN
                 v_category_code := SUBSTRING(REGEXP_REPLACE(UPPER(v_category_name), '[^A-Z0-9]', '', 'g'), 1, 4);
                 -- Postgres padding
                 v_category_code := RPAD(v_category_code, 3, 'X');
            END IF;
        END IF;
    END IF;

    -- 2. Get Product Code
    -- Upper case, remove non-alphanumeric, take first 8 chars
    v_product_code := SUBSTRING(REGEXP_REPLACE(UPPER(NEW.name), '[^A-Z0-9]', '', 'g'), 1, 8);
    
    -- 3. Find Sequence
    v_sku_pattern := 'WD-' || v_category_code || '-' || v_product_code || '-%';
    
    SELECT sku INTO v_last_sku
    FROM products
    WHERE sku LIKE v_sku_pattern
    ORDER BY sku DESC
    LIMIT 1;

    IF v_last_sku IS NOT NULL THEN
        -- Extract the sequence part (last part after dash)
        v_sequence := CAST(SPLIT_PART(v_last_sku, '-', 4) AS INTEGER) + 1;
    ELSE
        v_sequence := 1;
    END IF;

    -- 4. Construct SKU
    -- Format: WD-{CATEGORY}-{PRODUCT}-{SEQUENCE} (001, 002...)
    NEW.sku := 'WD-' || v_category_code || '-' || v_product_code || '-' || LPAD(v_sequence::TEXT, 3, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to allow idempotent runs (though filename is unique usually)
DROP TRIGGER IF EXISTS trigger_generate_sku ON products;

CREATE TRIGGER trigger_generate_sku
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_sku();
