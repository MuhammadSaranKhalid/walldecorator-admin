-- Migration: 20260219000001_create_order_email_trigger
-- Description: Adds a trigger on the orders table that fires an HTTP request to
--              a Supabase Edge Function after every new order insert. The Edge
--              Function is responsible for fetching order items + shipping address
--              and sending the confirmation email via Resend.
--
-- Required Vault secrets:
--   order_email_api_url  — URL of the Edge Function (e.g. https://<ref>.supabase.co/functions/v1/send-order-email)
--   service_role_key     — Supabase service-role key (already used by trigger_process_image)

CREATE OR REPLACE FUNCTION public.trigger_send_order_confirmation_email()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, vault, net, extensions
AS $$
DECLARE
  function_url text;
  service_key  text;
BEGIN
  -- Retrieve secrets from Supabase Vault
  SELECT decrypted_secret INTO function_url
  FROM vault.decrypted_secrets
  WHERE name = 'order_email_api_url'
  LIMIT 1;

  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  -- Skip silently if secrets are not configured yet
  IF function_url IS NULL OR service_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fire-and-forget HTTP POST to the Edge Function
  -- The Edge Function receives the full orders row and handles:
  --   1. Fetching order_items for this order
  --   2. Fetching the shipping address
  --   3. Sending the confirmation email via Resend
  PERFORM
    net.http_post(
      function_url,
      jsonb_build_object('record', row_to_json(NEW)),
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      5000
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger — fires once per new order row
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_order_confirmation_email();
