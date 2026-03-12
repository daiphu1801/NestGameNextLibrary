#!/usr/bin/env node
/**
 * upload-roms-to-r2.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Upload NES ROM files to Cloudflare R2.
 * Reads games.json to get the file list, scans the ROM folder, then uploads
 * only files that don't already exist in R2 (HEAD-check before PUT).
 *
 * Usage:
 *   node scripts/upload-roms-to-r2.js --input "F:\path\to\roms" [options]
 *
 * Options:
 *   --input   <path>   Folder containing ROM files
 *   --account <id>     R2 Account ID (or set R2_ACCOUNT_ID env)
 *   --key     <key>    R2 Access Key ID (or set R2_ACCESS_KEY_ID env)
 *   --secret  <sec>    R2 Secret Access Key (or set R2_SECRET_ACCESS_KEY env)
 *   --bucket  <name>   R2 Bucket name (default: nesgame, or R2_BUCKET_NAME env)
 *   --prefix  <pfx>    Key prefix in R2 (default: empty — files stored at root)
 *   --concurrency <n>  Parallel uploads (default: 5)
 *   --dry-run          List files that would be uploaded, don't upload
 *   --skip-existing    Skip HEAD check, always upload (faster but may re-upload)
 *   --games   <path>   Path to games.json (default: frontend/src/data/games.json)
 *   --env     <path>   Path to .env.local to read R2 credentials from
 */

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const crypto  = require('crypto');

// ─── CLI args ──────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const getArg  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const hasFlag = (flag) => args.includes(flag);

// ─── Load .env.local if requested ─────────────────────────────────────────────
const envFile = getArg('--env') || path.join(__dirname, '..', 'frontend', '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const inputFolder   = getArg('--input');
const R2_ACCOUNT_ID = getArg('--account') || process.env.R2_ACCOUNT_ID;
const ACCESS_KEY    = getArg('--key')     || process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY    = getArg('--secret')  || process.env.R2_SECRET_ACCESS_KEY;
const BUCKET        = getArg('--bucket')  || process.env.R2_BUCKET_NAME || 'nesgame';
const PREFIX        = getArg('--prefix')  || '';   // e.g. '' means root, 'roms/' stores under roms/ prefix
const CONCURRENCY   = parseInt(getArg('--concurrency') || '5', 10);
const DRY_RUN       = hasFlag('--dry-run');
const SKIP_EXISTING = hasFlag('--skip-existing');
const gamesPath     = getArg('--games') || path.join(__dirname, '..', 'frontend', 'src', 'data', 'games.json');

if (!inputFolder) {
  console.error('\nUsage: node scripts/upload-roms-to-r2.js --input "<ROM folder>" [options]\n');
  process.exit(1);
}
if (!DRY_RUN && (!R2_ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY)) {
  console.error('\nMissing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY\n');
  console.error('Or use: --account <id> --key <key> --secret <secret>\n');
  console.error('Or create frontend/.env.local with those values.\n');
  process.exit(1);
}

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// ─── AWS-compliant URI encoder ────────────────────────────────────────────────
// AWS SigV4 unreserved chars: A-Za-z0-9 - . _ ~  (does NOT include ! ' ( ) *)
// encodeURIComponent keeps ! ' ( ) * unencoded, so we must encode those too.
function awsEncodeURIComponent(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

// ─── AWS Signature V4 (no SDK dependency) ─────────────────────────────────────
function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}
function hmacHex(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function signRequest({ method, host, path: urlPath, headers, body, accessKey, secretKey, region = 'auto', service = 's3' }) {
  const now = new Date();
  const datestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 8);
  const amzdate   = now.toISOString().replace(/[^0-9T]/g, '').slice(0, 15) + 'Z';

  const payloadHash = sha256Hex(body || '');

  const allHeaders = {
    host,
    'x-amz-date': amzdate,
    'x-amz-content-sha256': payloadHash,
    ...headers,
  };

  // Canonical headers (sorted)
  const sortedKeys    = Object.keys(allHeaders).map(k => k.toLowerCase()).sort();
  const canonicalHdrs = sortedKeys.map(k => `${k}:${allHeaders[Object.keys(allHeaders).find(h => h.toLowerCase() === k)]}\n`).join('');
  const signedHdrs    = sortedKeys.join(';');

  const canonicalReq = [method, urlPath, '', canonicalHdrs, signedHdrs, payloadHash].join('\n');
  const credScope     = `${datestamp}/${region}/${service}/aws4_request`;
  const strToSign     = ['AWS4-HMAC-SHA256', amzdate, credScope, sha256Hex(canonicalReq)].join('\n');

  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, datestamp), region), service), 'aws4_request');
  const signature  = hmacHex(signingKey, strToSign);

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHdrs}, Signature=${signature}`;

  return { ...allHeaders, authorization: authHeader, 'x-amz-date': amzdate, 'x-amz-content-sha256': payloadHash };
}

// ─── R2 Helpers ───────────────────────────────────────────────────────────────
function r2Request({ method, key, body, extraHeaders = {} }) {
  return new Promise((resolve, reject) => {
    const host       = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const encodedKey = key.split('/').map(awsEncodeURIComponent).join('/');
    const urlPath    = `/${BUCKET}/${encodedKey}`;

    const headers = signRequest({
      method, host, path: urlPath,
      headers: { ...extraHeaders, ...(body ? { 'content-length': Buffer.byteLength(body).toString() } : {}) },
      body: body || '',
      accessKey: ACCESS_KEY, secretKey: SECRET_KEY,
    });

    const options = { hostname: host, path: urlPath, method, headers };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function existsInR2(key) {
  try {
    const res = await r2Request({ method: 'HEAD', key });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function uploadToR2(key, buffer, contentType) {
  const host       = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const encodedKey = key.split('/').map(awsEncodeURIComponent).join('/');
  const urlPath    = `/${BUCKET}/${encodedKey}`;
  const payloadHash = sha256Hex(buffer);

  const headers = signRequest({
    method: 'PUT', host, path: urlPath,
    headers: {
      'content-type': contentType,
      'content-length': buffer.length.toString(),
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body: buffer,
    accessKey: ACCESS_KEY, secretKey: SECRET_KEY,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: host, path: urlPath, method: 'PUT',
      headers: { ...headers, 'content-length': buffer.length },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          resolve({ status: res.statusCode });
        } else {
          reject(new Error(`R2 PUT failed: HTTP ${res.statusCode} — ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// ─── Content type ─────────────────────────────────────────────────────────────
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const map = {
    '.nes': 'application/octet-stream',
    '.zip': 'application/zip',
    '.7z':  'application/x-7z-compressed',
    '.fds': 'application/octet-stream',
    '.nst': 'application/octet-stream',
  };
  return map[ext] || 'application/octet-stream';
}

// ─── Concurrency helper ───────────────────────────────────────────────────────
async function pLimit(tasks, limit) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📤  NES ROM → Cloudflare R2 Upload Script');
  console.log('═══════════════════════════════════════════════════════════');

  if (!fs.existsSync(inputFolder)) {
    console.error(`ROM folder not found: ${inputFolder}`);
    process.exit(1);
  }

  // Load games.json to know which filenames are needed
  const games        = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
  const neededFiles  = new Set(games.map(g => g.fileName || g.path).filter(Boolean));
  console.log(`📋 games.json has ${games.length} games → ${neededFiles.size} unique fileNames`);

  // Scan ROM folder
  const allRomFiles = fs.readdirSync(inputFolder).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.nes', '.zip', '.7z', '.fds', '.nst'].includes(ext);
  });
  console.log(`📁 Found ${allRomFiles.length} ROM files in folder`);

  // Only process files that are referenced in games.json
  const toProcess = allRomFiles.filter(f => neededFiles.has(f));
  const notInDB   = allRomFiles.filter(f => !neededFiles.has(f));
  console.log(`🎯 ${toProcess.length} match games.json  |  ${notInDB.length} not in DB (skip)`);
  console.log(`🪣 Bucket: ${BUCKET}  |  Prefix: "${PREFIX}"  |  Concurrency: ${CONCURRENCY}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — no files uploaded.\n');
    console.log('Files that would be uploaded:');
    toProcess.slice(0, 20).forEach(f => console.log(`  ${PREFIX}${f}`));
    if (toProcess.length > 20) console.log(`  ... and ${toProcess.length - 20} more`);
    return;
  }

  console.log('\n🚀 Starting upload...\n');

  let uploaded = 0, skipped = 0, failed = 0;
  const errors = [];
  const startTime = Date.now();

  const tasks = toProcess.map(fileName => async () => {
    const key = `${PREFIX}${fileName}`;
    const filePath = path.join(inputFolder, fileName);

    try {
      // HEAD check to skip already-uploaded files
      if (!SKIP_EXISTING) {
        const exists = await existsInR2(key);
        if (exists) {
          skipped++;
          process.stdout.write(`\r⏭  Skipped (exists): ${skipped} | Uploaded: ${uploaded} | Failed: ${failed}   `);
          return;
        }
      }

      const buffer      = fs.readFileSync(filePath);
      const contentType = getContentType(fileName);
      await uploadToR2(key, buffer, contentType);
      uploaded++;
      process.stdout.write(`\r✅ Uploaded: ${uploaded} | Skipped: ${skipped} | Failed: ${failed}   `);
    } catch (err) {
      failed++;
      errors.push({ fileName, error: err.message });
      process.stdout.write(`\r✅ Uploaded: ${uploaded} | Skipped: ${skipped} | ❌ Failed: ${failed}   `);
    }
  });

  await pLimit(tasks, CONCURRENCY);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Done in ${elapsed}s`);
  console.log(`   Uploaded : ${uploaded}`);
  console.log(`   Skipped  : ${skipped} (already in R2)`);
  console.log(`   Failed   : ${failed}`);

  if (errors.length > 0) {
    const logPath = path.join(__dirname, 'upload-errors.log');
    fs.writeFileSync(logPath, errors.map(e => `${e.fileName}\t${e.error}`).join('\n'), 'utf8');
    console.log(`\n⚠️  ${errors.length} errors logged → ${logPath}`);
    console.log('First 5 errors:');
    errors.slice(0, 5).forEach(e => console.log(`  ${e.fileName}: ${e.error}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
