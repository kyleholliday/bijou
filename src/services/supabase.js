import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Opt out of the cross-tab navigator-lock mutex Supabase uses to
    // coordinate token refreshes between tabs. It's what was throwing the
    // "Acquiring an exclusive Navigator LockManager lock ... immediately
    // failed" console error (harmless, but noisy — common with CRA's dev
    // Fast Refresh and/or multiple tabs open). Not needed for this app.
    lock: (_name, _acquireTimeout, fn) => fn(),
  },
});
