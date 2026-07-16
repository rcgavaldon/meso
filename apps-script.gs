/**
 * Meso 🏋 — Google Sheet backup for Robert & Nina's training log.
 *
 * SETUP (one time, ~5 min):
 *  1. New Google Sheet (sheets.new). Name it e.g. "Meso Training Log".
 *  2. Extensions ▸ Apps Script. Delete the sample, paste ALL of this, Save 💾.
 *  3. Deploy ▸ New deployment ▸ (gear) Web app.
 *       Execute as: Me · Who has access: Anyone
 *     Deploy, Authorize, and COPY the Web app URL (ends in /exec).
 *  4. In Meso: More ▸ paste the URL ▸ "Save link" ▸ "Back up now".
 *
 * ⚠️ THE FIX vs garden-tracker/apps-script.gs
 * Sprout's doPost() writes a whole-blob snapshot and rebuilds its data tabs with table_(),
 * which CLEARS them first. That's fine for one user on one phone. With two people on two
 * phones it's a data-loss bug: whoever syncs last clobbers the other's history, and doGet()
 * hands back only the most recent blob regardless of who asked.
 *
 * So here EVERYTHING is keyed by user:
 *   - the Backup tab carries a User column, and doGet(?user=) reads that user's latest row
 *   - the readable tabs are per-user (Sets — rob, Sets — nina)
 *   - Backup is append-only, so every sync is a restore point, not an overwrite
 *
 * KEEP is ~200 rows/user ≈ a year of sessions (Sprout keeps 50).
 */
const TAB_BACKUP = 'Backup';
const KEEP = 200;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var user = String(data.userId || 'unknown');
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Append-only restore points, KEYED BY USER. Never clobbers the other person.
    var b = sheet_(ss, TAB_BACKUP, ['Saved at', 'User', 'Sessions', 'Data (JSON)']);
    b.appendRow([new Date(), user, (data.sessions || []).length, e.postData.contents]);
    trimUser_(b, user, KEEP);

    // Human-readable, per user. Safe to clear: it's this user's tab only.
    var rows = [];
    (data.sessions || []).forEach(function (s) {
      (s.sets || []).forEach(function (x) {
        if (x.reps == null || x.reps < 0) return;               // skipped sets write reps:-1
        rows.push([s.date || '', s.week || '', s.day || '', x.muscle || '', x.exId || '',
                   x.load || '', x.reps, x.rir == null ? '' : x.rir,
                   s.gymId || '', s.off_plan ? 'travel' : '',
                   x.sub ? ('sub for ' + x.sub.of) : '']);
      });
    });
    table_(ss, 'Sets - ' + user,
      ['Date', 'Week', 'Day', 'Muscle', 'Exercise', 'Weight', 'Reps', 'RIR', 'Gym', 'Off plan', 'Note'], rows);

    // Load state = the progression memory that must survive a lost phone.
    table_(ss, 'Loads - ' + user, ['Key', 'Exercise', 'Weight', 'Reps', 'RIR', 'e1RM', 'Updated'],
      (data.loadState || []).map(function (l) {
        return [l.k, l.exId || '', l.load || '', l.reps || '', l.rir == null ? '' : l.rir,
                l.e1rm ? Math.round(l.e1rm) : '', l.at || ''];
      }));

    return json_({ ok: true, user: user, saved: new Date() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** doGet(?user=rob) → that user's most recent snapshot. Without ?user, the most recent of anyone. */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var b = ss.getSheetByName(TAB_BACKUP);
  var want = e && e.parameter && e.parameter.user;
  if (!b || b.getLastRow() < 2) return json_({ v: 1, userId: want || '', mesos: [], sessions: [], loadState: [] });

  var vals = b.getRange(2, 1, b.getLastRow() - 1, 4).getValues();
  for (var i = vals.length - 1; i >= 0; i--) {
    if (!want || String(vals[i][1]) === String(want)) {
      try { return json_(JSON.parse(vals[i][3])); } catch (_) {}
    }
  }
  return json_({ v: 1, userId: want || '', mesos: [], sessions: [], loadState: [] });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet_(ss, name, headers) {
  var s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(headers); s.setFrozenRows(1); }
  return s;
}
function table_(ss, name, headers, rows) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  s.clear(); s.appendRow(headers);
  if (rows.length) s.getRange(2, 1, rows.length, headers.length).setValues(rows);
  s.setFrozenRows(1);
}
/** Trim only THIS user's rows past KEEP — leaves the other person's history untouched. */
function trimUser_(s, user, keep) {
  var n = s.getLastRow() - 1;
  if (n <= keep) return;
  var vals = s.getRange(2, 2, n, 1).getValues();     // User column
  var mine = [];
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === String(user)) mine.push(i + 2);
  if (mine.length <= keep) return;
  var drop = mine.slice(0, mine.length - keep);
  for (var j = drop.length - 1; j >= 0; j--) s.deleteRow(drop[j]);   // bottom-up, or indices shift
}
