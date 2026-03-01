#!/usr/bin/env node

/**
 * Script to reprocess unprocessed product images
 *
 * This script calls the admin API endpoint to batch process
 * all images that were created when the process-images endpoint
 * was unavailable.
 *
 * Usage:
 *   node scripts/reprocess-images.js
 *
 * Or make it executable and run:
 *   chmod +x scripts/reprocess-images.js
 *   ./scripts/reprocess-images.js
 */

require('dotenv').config({ path: '.env.production' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
    console.error('Make sure you have a .env.local file with this variable set');
    process.exit(1);
}

async function reprocessImages() {
    console.log('Starting batch image reprocessing...');
    console.log(`Calling: ${SITE_URL}/api/admin/reprocess-images\n`);

    try {
        const response = await fetch(`${SITE_URL}/api/admin/reprocess-images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        console.log('✓ Batch processing completed!\n');
        console.log('Summary:');
        console.log(`  Total images found: ${result.total}`);
        console.log(`  Successfully processed: ${result.processed}`);
        console.log(`  Failed: ${result.failed}\n`);

        if (result.failed > 0) {
            console.log('Failed images:');
            result.results
                .filter(r => r.status === 'failed')
                .forEach(r => {
                    console.log(`  - Image ${r.id}: ${r.error}`);
                });
        }

        if (result.processed > 0) {
            console.log(`\n✓ ${result.processed} images successfully reprocessed!`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

reprocessImages();
