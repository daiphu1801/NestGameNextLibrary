#!/usr/bin/env node
/**
 * upload-snes-roms-to-r2.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Upload SNES ROM files to Cloudflare R2 AND merge into games.json.
 * Scans the ROM folder for SNES files (.sfc, .smc, .zip, .7z, .fig, .swc)
 * and uploads only files that don't already exist in R2 (HEAD-check before PUT).
 * After upload, merges SNES game entries into the shared games.json with system: 'snes'.
 *
 * Usage:
 *   node scripts/upload-snes-roms-to-r2.js --input "F:\File Gia Lap" [options]
 *
 * Options:
 *   --input   <path>   Folder containing SNES ROM files (default: F:\File Gia Lap)
 *   --account <id>     R2 Account ID (or set R2_ACCOUNT_ID env)
 *   --key     <key>    R2 Access Key ID (or set R2_ACCESS_KEY_ID env)
 *   --secret  <sec>    R2 Secret Access Key (or set R2_SECRET_ACCESS_KEY env)
 *   --bucket  <name>   R2 Bucket name (default: nesgame, or R2_BUCKET_NAME env)
 *   --prefix  <pfx>    Key prefix in R2 (default: snes/)
 *   --concurrency <n>  Parallel uploads (default: 5)
 *   --dry-run          List files that would be uploaded, don't upload
 *   --skip-existing    Skip HEAD check, always upload (faster but may re-upload)
 *   --env     <path>   Path to .env.local to read R2 credentials from
 *   --games   <path>   Path to games.json (default: frontend/src/data/games.json)
 *   --no-json          Skip updating games.json
 */

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
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

const inputFolder   = getArg('--input') || 'F:\\File Gia Lap';
const R2_ACCOUNT_ID = getArg('--account') || process.env.R2_ACCOUNT_ID;
const ACCESS_KEY    = getArg('--key')     || process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY    = getArg('--secret')  || process.env.R2_SECRET_ACCESS_KEY;
const BUCKET        = getArg('--bucket')  || process.env.R2_BUCKET_NAME || 'nesgame';
const PREFIX        = getArg('--prefix')  || 'snes/';
const CONCURRENCY   = parseInt(getArg('--concurrency') || '5', 10);
const DRY_RUN       = hasFlag('--dry-run');
const SKIP_EXISTING = hasFlag('--skip-existing');
const NO_JSON       = hasFlag('--no-json');
const gamesJsonPath = getArg('--games') || path.join(__dirname, '..', 'frontend', 'src', 'data', 'games.json');

if (!inputFolder) {
  console.error('\nUsage: node scripts/upload-snes-roms-to-r2.js --input "<ROM folder>" [options]\n');
  process.exit(1);
}
if (!DRY_RUN && (!R2_ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY)) {
  console.error('\nMissing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY\n');
  console.error('Or use: --account <id> --key <key> --secret <secret>\n');
  console.error('Or create frontend/.env.local with those values.\n');
  process.exit(1);
}

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// ─── SNES file extensions ─────────────────────────────────────────────────────
const SNES_EXTENSIONS = ['.sfc', '.smc', '.zip', '.7z', '.fig', '.swc', '.smc.gz', '.bs'];

function isSnesFile(fileName) {
  const lower = fileName.toLowerCase();
  return SNES_EXTENSIONS.some(ext => lower.endsWith(ext));
}

// ─── AWS-compliant URI encoder ────────────────────────────────────────────────
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

function signRequest({ method, host, path: urlPath, headers, payloadHash, accessKey, secretKey, region = 'auto', service = 's3' }) {
  const now = new Date();
  const datestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 8);
  const amzdate   = now.toISOString().replace(/[^0-9T]/g, '').slice(0, 15) + 'Z';

  // Use pre-computed payloadHash (avoids re-hashing large buffers)
  const hash = payloadHash || sha256Hex('');

  const allHeaders = {
    host,
    'x-amz-date': amzdate,
    'x-amz-content-sha256': hash,
    ...headers,
  };

  // Normalize all header keys to lowercase for consistent signing
  const normalizedHeaders = {};
  for (const [k, v] of Object.entries(allHeaders)) {
    normalizedHeaders[k.toLowerCase()] = String(v).trim();
  }

  const sortedKeys    = Object.keys(normalizedHeaders).sort();
  const canonicalHdrs = sortedKeys.map(k => `${k}:${normalizedHeaders[k]}\n`).join('');
  const signedHdrs    = sortedKeys.join(';');

  const canonicalReq = [method, urlPath, '', canonicalHdrs, signedHdrs, hash].join('\n');
  const credScope     = `${datestamp}/${region}/${service}/aws4_request`;
  const strToSign     = ['AWS4-HMAC-SHA256', amzdate, credScope, sha256Hex(canonicalReq)].join('\n');

  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, datestamp), region), service), 'aws4_request');
  const signature  = hmacHex(signingKey, strToSign);

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHdrs}, Signature=${signature}`;

  return { ...normalizedHeaders, authorization: authHeader, 'x-amz-date': amzdate, 'x-amz-content-sha256': hash };
}

// ─── R2 Helpers ───────────────────────────────────────────────────────────────
function r2Request({ method, key, body, extraHeaders = {} }) {
  return new Promise((resolve, reject) => {
    const host       = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const encodedKey = key.split('/').map(awsEncodeURIComponent).join('/');
    const urlPath    = `/${BUCKET}/${encodedKey}`;
    const bodyBuf = body ? Buffer.from(body) : null;
    const payloadHash = sha256Hex(bodyBuf || '');

    const hdrs = { ...extraHeaders };
    if (bodyBuf) hdrs['content-length'] = bodyBuf.length.toString();

    const headers = signRequest({
      method, host, path: urlPath,
      headers: hdrs,
      payloadHash,
      accessKey: ACCESS_KEY, secretKey: SECRET_KEY,
    });

    const options = { hostname: host, path: urlPath, method, headers };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (bodyBuf) req.write(bodyBuf);
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
    payloadHash,
    accessKey: ACCESS_KEY, secretKey: SECRET_KEY,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: host, path: urlPath, method: 'PUT',
      headers,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          resolve({ status: res.statusCode });
        } else {
          reject(new Error(`R2 PUT failed: HTTP ${res.statusCode} — ${data.substring(0, 200)}`));
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
    '.sfc': 'application/octet-stream',
    '.smc': 'application/octet-stream',
    '.fig': 'application/octet-stream',
    '.swc': 'application/octet-stream',
    '.bs':  'application/octet-stream',
    '.zip': 'application/zip',
    '.7z':  'application/x-7z-compressed',
    '.gz':  'application/gzip',
  };
  return map[ext] || 'application/octet-stream';
}

// ─── Scan folder recursively ──────────────────────────────────────────────────
function scanFolder(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanFolder(fullPath));
    } else if (entry.isFile() && isSnesFile(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Format file size ─────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SNES GAME METADATA HELPERS ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LIBRETRO_SNES_BASE = 'https://thumbnails.libretro.com/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System';

/**
 * Parse region code from SNES ROM filename.
 */
function parseRegion(fileName) {
  const regionMatch = fileName.match(/\(([A-Za-z, ]+?)\)(?:\s*\[.*?\])*\s*\.\w+$/);
  if (!regionMatch) return { code: 'Unknown', display: '🌍 Unknown' };

  const code = regionMatch[1].trim();
  const regionMap = {
    'U':     '🇺🇸 USA',
    'J':     '🇯🇵 Japan',
    'E':     '🇪🇺 Europe',
    'JU':    '🇯🇵🇺🇸 Japan/USA',
    'UE':    '🇺🇸🇪🇺 USA/Europe',
    'JE':    '🇯🇵🇪🇺 Japan/Europe',
    'JUE':   '🌍 World',
    'W':     '🌍 World',
    'As':    '🌏 Asia',
    'Unl':   '🔓 Unlicensed',
    'PD':    '📂 Public Domain',
    'F':     '🇫🇷 France',
    'G':     '🇩🇪 Germany',
    'S':     '🇪🇸 Spain',
    'I':     '🇮🇹 Italy',
    'Sw':    '🇸🇪 Sweden',
    'Nl':    '🇳🇱 Netherlands',
    'No':    '🇳🇴 Norway',
    'A':     '🇦🇺 Australia',
    'K':     '🇰🇷 Korea',
    'C':     '🇨🇳 China',
    'B':     '🇧🇷 Brazil',
    'FC':    '🇫🇷🇨🇦 France/Canada',
    'H':     '🇳🇱 Holland',
  };

  let display = regionMap[code] || `🌍 ${code}`;
  if (fileName.includes('[!]')) {
    display += ', ✅ Verified';
  }

  return { code, display };
}

/**
 * Parse game name from filename (remove extension, region codes, dump tags).
 */
function parseGameName(fileName) {
  let name = fileName;
  name = name.replace(/\.(sfc|smc|zip|7z|fig|swc|bs|gz)$/i, '');
  name = name.replace(/\.smc$/i, '');
  name = name.replace(/\s*\((?:[A-Za-z, ]+|V[\d.]+|Rev\s*\d+|Proto(?:type)?|Beta|Sample|Hack|Unl|PD)\)\s*/g, ' ');
  name = name.replace(/\s*\[.*?\]\s*/g, ' ');
  return name.trim();
}

/**
 * Guess category — uses same GameCategoryKey values as types/game.ts:
 * platformer, rpg, sports, fighting, puzzle, racing, shooter, strategy, adventure, action, arcade, simulation, other
 */
function guessCategory(gameName) {
  const lower = gameName.toLowerCase();

  // RPG
  if (/final fantasy|dragon quest|chrono|secret of mana|earthbound|breath of fire|lufia|illusion of|terranigma|soul blazer|seiken densetsu|tales of|phantasy star|ogre battle|paladin|mystic|saga|brain lord|7th saga|robotrek/i.test(lower)) return 'rpg';

  // Platformer
  if (/mario(?! kart| paint| is missing)|donkey kong|mega man|kirby|castlevania|metroid|yoshi|rayman|earthworm jim|aladdin|lion king|jungle|kong|adventure island|sparkster|actraiser|plok|bubsy/i.test(lower)) return 'platformer';

  // Fighting
  if (/street fighter|mortal kombat|fatal fury|art of fighting|samurai|king of fighters|dragon ball|tekken|killer instinct|power rangers|fight(?:ing|er)|kombat|martial|clay fighter|primal rage|world heroes/i.test(lower)) return 'fighting';

  // Action
  if (/contra|ninja|batman|spider.man|wolverine|x-men|tmnt|turtles|ghoul|super star wars|alien|predator|run saber|hagane|gundam|hokuto/i.test(lower)) return 'action';

  // Shooter / Shoot 'em up
  if (/gradius|r-type|axelay|thunder|star fox|starfox|space|shoot|gun|strike|1942|1943|macross|darius|parodius|biometal|area 88|blazeon|u\.n\. squadron/i.test(lower)) return 'shooter';

  // Racing
  if (/mario kart|f-zero|top gear|race|racing|grand prix|nascar|rally|speed|drift|road|enduro|stunt/i.test(lower)) return 'racing';

  // Sports
  if (/football|soccer|baseball|basketball|hockey|tennis|golf|boxing|wrestling|nba|nfl|mlb|nhl|fifa|olympic|sport|madden|ken griffey|tecmo/i.test(lower)) return 'sports';

  // Puzzle
  if (/tetris|puzzle|dr\. mario|bust.a.move|puyo|columns|panel de pon|picross|wario.*woods|pipe dream/i.test(lower)) return 'puzzle';

  // Strategy
  if (/fire emblem|advance wars|ogre|civilization|sim city|simcity|command|strategy|tactics|chess|war(?:craft)?|populous|warlord|daisenryaku/i.test(lower)) return 'strategy';

  // Simulation
  if (/sim(?:ulation|earth|ant|farm|life)|harvest moon|mario paint|pilotwings|aerobiz/i.test(lower)) return 'simulation';

  // Arcade
  if (/pac.man|pinball|arkanoid|breakout|pong|galaga|frogger|bomberman|lemmings/i.test(lower)) return 'arcade';

  // Adventure
  if (/zelda|adventure|quest|mystery|detective|mana|shadowrun|out of this world|flashback|prince of persia/i.test(lower)) return 'adventure';

  return 'other';
}

/**
 * Get libretro thumbnail name (convert region codes to full names, remove dump flags).
 */
function getLibretroName(fileName) {
  let name = fileName;
  name = name.replace(/\.(sfc|smc|zip|7z|fig|swc|bs|gz)$/i, '');
  name = name.replace(/\.smc$/i, '');

  const regionReplacements = [
    [/\(J\)/g, '(Japan)'],
    [/\(U\)/g, '(USA)'],
    [/\(E\)/g, '(Europe)'],
    [/\(JU\)/g, '(Japan, USA)'],
    [/\(UE\)/g, '(USA, Europe)'],
    [/\(JE\)/g, '(Japan, Europe)'],
    [/\(JUE\)/g, '(Japan, USA, Europe)'],
    [/\(W\)/g, '(World)'],
    [/\(As\)/g, '(Asia)'],
    [/\(F\)/g, '(France)'],
    [/\(G\)/g, '(Germany)'],
    [/\(S\)/g, '(Spain)'],
    [/\(I\)/g, '(Italy)'],
    [/\(Sw\)/g, '(Sweden)'],
    [/\(Nl\)/g, '(Netherlands)'],
    [/\(No\)/g, '(Norway)'],
    [/\(A\)/g, '(Australia)'],
    [/\(K\)/g, '(Korea)'],
    [/\(C\)/g, '(China)'],
    [/\(B\)/g, '(Brazil)'],
    [/\(Unl\)/g, '(USA) (Unl)'],
  ];

  for (const [pattern, replacement] of regionReplacements) {
    name = name.replace(pattern, replacement);
  }
  name = name.replace(/\s*\[.*?\]/g, '');

  return name.trim();
}

/**
 * Generate description based on category & region.
 */
function generateDescription(category, region) {
  const descs = {
    'rpg':        'Game nhập vai SNES huyền thoại',
    'platformer': 'Game hành động platform SNES hấp dẫn',
    'fighting':   'Game đối kháng SNES kịch tính',
    'action':     'Game hành động SNES đầy kịch tính',
    'shooter':    'Game bắn súng SNES hành động',
    'racing':     'Game đua xe SNES tốc độ',
    'sports':     'Game thể thao SNES',
    'puzzle':     'Game giải đố SNES',
    'strategy':   'Game chiến thuật SNES đòi hỏi tư duy',
    'adventure':  'Game phiêu lưu SNES khám phá',
    'arcade':     'Game arcade SNES cổ điển',
    'simulation': 'Game mô phỏng SNES',
    'other':      'Game SNES kinh điển',
  };
  return `${descs[category] || descs.other}. Region: ${region}`;
}

// Well-known SNES featured games
const FEATURED_KEYWORDS = [
  'super mario world', 'legend of zelda', 'chrono trigger',
  'super metroid', 'final fantasy', 'donkey kong country',
  'street fighter ii', 'mega man x', 'earthbound', 'secret of mana',
  'super mario kart', 'f-zero', 'star fox', 'kirby',
  'contra iii', 'castlevania', 'super mario rpg',
  'super mario all-stars', 'mortal kombat', 'killer instinct',
  'breath of fire', 'lufia', 'terranigma', 'illusion of',
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MERGE INTO games.json ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function mergeIntoGamesJson(allFiles) {
  console.log('\n📝 Merging SNES games into games.json...');

  // 1. Read existing games.json
  let existingGames = [];
  if (fs.existsSync(gamesJsonPath)) {
    existingGames = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
    console.log(`   📖 Read ${existingGames.length} existing entries from games.json`);
  }

  // 2. Separate: keep non-SNES entries, remove old SNES entries (avoid duplicates on re-run)
  const nonSnesGames = existingGames.filter(g => g.system !== 'snes');
  const removedCount = existingGames.length - nonSnesGames.length;
  if (removedCount > 0) {
    console.log(`   🗑️  Removed ${removedCount} old SNES entries (will be replaced)`);
  }

  // 3. Find max ID from non-SNES games
  let maxId = 0;
  for (const g of nonSnesGames) {
    const numId = typeof g.id === 'string' ? parseInt(g.id, 10) : g.id;
    if (numId > maxId) maxId = numId;
  }

  // 4. Build new SNES entries
  const snesGames = allFiles.map((filePath, index) => {
    const fileName = path.basename(filePath);
    const gameName = parseGameName(fileName);
    const region   = parseRegion(fileName);
    const category = guessCategory(gameName);
    const rating   = Math.floor(Math.random() * 3) + 3; // 3-5

    const libretroName = getLibretroName(fileName);
    const encodedName  = encodeURIComponent(libretroName).replace(/%20/g, '%20');

    const lower = gameName.toLowerCase();
    const isFeatured = FEATURED_KEYWORDS.some(kw => lower.includes(kw));

    return {
      id: maxId + index + 1,
      name: gameName,
      fileName: fileName,
      path: `snes/${fileName}`,
      category: category,
      description: generateDescription(category, region.display),
      rating: isFeatured ? 5 : rating,
      year: null,
      isFeatured: isFeatured,
      region: region.display,
      system: 'snes',
      image:      `${LIBRETRO_SNES_BASE}/Named_Boxarts/${encodedName}.png`,
      imageSnap:  `${LIBRETRO_SNES_BASE}/Named_Snaps/${encodedName}.png`,
      imageTitle: `${LIBRETRO_SNES_BASE}/Named_Titles/${encodedName}.png`,
    };
  });

  // Sort SNES games by name
  snesGames.sort((a, b) => a.name.localeCompare(b.name));

  // Re-assign SNES IDs after sort (keep sequential from maxId)
  snesGames.forEach((g, i) => { g.id = maxId + i + 1; });

  // 5. Merge: non-SNES + new SNES
  const mergedGames = [...nonSnesGames, ...snesGames];

  // 6. Write back
  fs.writeFileSync(gamesJsonPath, JSON.stringify(mergedGames, null, 2), 'utf8');

  // 7. Stats
  const snesCount = snesGames.length;
  const totalCount = mergedGames.length;
  let featuredCount = 0;
  const categories = {};
  const regions = {};

  for (const g of snesGames) {
    categories[g.category] = (categories[g.category] || 0) + 1;
    if (g.region) regions[g.region] = (regions[g.region] || 0) + 1;
    if (g.isFeatured) featuredCount++;
  }

  console.log(`\n✅ Updated ${gamesJsonPath}`);
  console.log(`   NES games : ${nonSnesGames.length}`);
  console.log(`   SNES games: ${snesCount} (NEW)`);
  console.log(`   Total     : ${totalCount}`);
  console.log(`   Featured  : ${featuredCount}`);
  console.log('   SNES Categories:');
  Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`     ${k}: ${v}`));
  console.log('   SNES Top Regions:');
  Object.entries(regions).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([k, v]) => console.log(`     ${k}: ${v}`));
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎮  SNES ROM → Cloudflare R2 Upload Script');
  console.log('═══════════════════════════════════════════════════════════');

  if (!fs.existsSync(inputFolder)) {
    console.error(`ROM folder not found: ${inputFolder}`);
    process.exit(1);
  }

  // Scan ROM folder (recursive) for SNES files
  console.log(`📁 Scanning folder: ${inputFolder}`);
  const allFiles = scanFolder(inputFolder);
  console.log(`📁 Found ${allFiles.length} SNES ROM files`);

  // Check for duplicate filenames in scan results
  const fileNameSet = new Set();
  const duplicates = [];
  for (const f of allFiles) {
    const name = path.basename(f);
    if (fileNameSet.has(name)) {
      duplicates.push(f);
    } else {
      fileNameSet.add(name);
    }
  }
  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate filenames (same name in subfolders — will use first found)`);
    // Remove duplicates, keep first occurrence
    const seen = new Set();
    const uniqueFiles = allFiles.filter(f => {
      const name = path.basename(f);
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
    allFiles.length = 0;
    allFiles.push(...uniqueFiles);
    console.log(`   Reduced to ${allFiles.length} unique files`);
  }

  // Calculate total size
  let totalSize = 0;
  for (const f of allFiles) {
    totalSize += fs.statSync(f).size;
  }
  console.log(`📦 Total size: ${formatSize(totalSize)}`);
  console.log(`🪣 Bucket: ${BUCKET}  |  Prefix: "${PREFIX}"  |  Concurrency: ${CONCURRENCY}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — no files uploaded.\n');
    console.log('Files that would be uploaded:');
    allFiles.slice(0, 30).forEach(f => {
      const relativeName = path.relative(inputFolder, f);
      const size = formatSize(fs.statSync(f).size);
      console.log(`  ${PREFIX}${relativeName}  (${size})`);
    });
    if (allFiles.length > 30) console.log(`  ... and ${allFiles.length - 30} more`);
    console.log(`\n📊 Total: ${allFiles.length} files, ${formatSize(totalSize)}`);

    // Generate games.json even in dry-run mode
    if (!NO_JSON) {
      mergeIntoGamesJson(allFiles);
    }
    return;
  }

  console.log('\n🚀 Starting upload...\n');

  let uploaded = 0, skipped = 0, failed = 0;
  const errors = [];
  const startTime = Date.now();

  const tasks = allFiles.map(filePath => async () => {
    const fileName = path.basename(filePath);
    const key = `${PREFIX}${fileName}`;

    try {
      // HEAD check — skip file if already exists in R2
      if (!SKIP_EXISTING) {
        const exists = await existsInR2(key);
        if (exists) {
          skipped++;
          process.stdout.write(`\r⏭  Skipped (exists in R2): ${skipped} | Uploaded: ${uploaded} | Failed: ${failed}   `);
          return;
        }
      }

      const buffer      = fs.readFileSync(filePath);
      const contentType = getContentType(filePath);
      await uploadToR2(key, buffer, contentType);
      uploaded++;
      process.stdout.write(`\r✅ Uploaded: ${uploaded} | Skipped: ${skipped} | Failed: ${failed}  [${uploaded + skipped + failed}/${allFiles.length}]   `);
    } catch (err) {
      failed++;
      errors.push({ fileName, error: err.message });
      process.stdout.write(`\r✅ Uploaded: ${uploaded} | Skipped: ${skipped} | ❌ Failed: ${failed}  [${uploaded + skipped + failed}/${allFiles.length}]   `);
    }
  });

  await pLimit(tasks, CONCURRENCY);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Upload done in ${elapsed}s`);
  console.log(`   Uploaded : ${uploaded}`);
  console.log(`   Skipped  : ${skipped} (already in R2 — trùng file)`);
  console.log(`   Failed   : ${failed}`);
  console.log(`   Total    : ${allFiles.length}`);

  if (errors.length > 0) {
    const logPath = path.join(__dirname, 'upload-snes-errors.log');
    fs.writeFileSync(logPath, errors.map(e => `${e.fileName}\t${e.error}`).join('\n'), 'utf8');
    console.log(`\n⚠️  ${errors.length} errors logged → ${logPath}`);
    console.log('First 5 errors:');
    errors.slice(0, 5).forEach(e => console.log(`  ${e.fileName}: ${e.error}`));
  }

  // ─── Merge into games.json ──────────────────────────────────────────────────
  if (!NO_JSON) {
    mergeIntoGamesJson(allFiles);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
