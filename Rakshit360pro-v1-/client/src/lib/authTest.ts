
export async function testSupabaseAuth() {
  try {
    const { supabase } = await import('./supabase');
    
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase auth test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase auth connection successful');
    console.log('Current session:', data.session ? 'Logged in' : 'Not logged in');
    
    return true;
  } catch (err) {
    console.error('❌ Supabase auth test error:', err);
    return false;
  }
}

// Call this function to test auth on app load
if (import.meta.env.DEV) {
  testSupabaseAuth();
}
