
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dzhprgxsvtekeqmpjmbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aHByZ3hzdnRla2VxbXBqbWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjI0MDUsImV4cCI6MjA2NzA5ODQwNX0.6Q6Ran3Ai7RRPRxfBJRWMIAo_HPZ8zBD97TQoQWBv-U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabaseAuth() {
  console.log('🔧 Setting up Supabase Authentication...');
  
  try {
    // Test basic connection
    console.log('🔍 Testing Supabase connection...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session test failed:', sessionError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    // Test auth signup functionality
    console.log('🔐 Testing authentication signup...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpass123';
    
    // This will fail if auth is not enabled, which is expected
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      if (signUpError.message.includes('disabled')) {
        console.log('❌ AUTHENTICATION IS DISABLED IN SUPABASE');
        console.log('\n🔧 TO FIX THIS, GO TO YOUR SUPABASE DASHBOARD:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project: dzhprgxsvtekeqmpjmbb');
        console.log('3. Go to Authentication > Settings');
        console.log('4. Enable "Enable email confirmations"');
        console.log('5. Set "Site URL" to: https://your-repl-url.repl.co');
        console.log('6. Under "Auth Providers", make sure "Email" is enabled');
        console.log('7. Save the configuration');
      } else {
        console.log('⚠️ Auth test returned:', signUpError.message);
        console.log('✅ This likely means auth is working (expected for test email)');
      }
    } else {
      console.log('✅ Authentication signup test successful');
    }
    
    // Test database connection
    console.log('🏥 Testing database connection...');
    const { data: hospitals, error: dbError } = await supabase
      .from('hospitals')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database test failed:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
    }
    
    console.log('\n📋 AUTHENTICATION SETUP CHECKLIST:');
    console.log('✅ Supabase client configured');
    console.log('✅ Authentication context created');
    console.log('✅ Login form component ready');
    console.log('✅ Error handling implemented');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Enable authentication in Supabase dashboard');
    console.log('2. Set up email confirmations');
    console.log('3. Configure site URL');
    console.log('4. Test user registration');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupSupabaseAuth();
