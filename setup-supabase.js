
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dzhprgxsvtekeqmpjmbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aHByZ3hzdnRla2VxbXBqbWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjI0MDUsImV4cCI6MjA2NzA5ODQwNX0.6Q6Ran3Ai7RRPRxfBJRWMIAo_HPZ8zBD97TQoQWBv-U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseSetup() {
  console.log('🔍 Checking Supabase connection...');
  
  try {
    // Test authentication
    console.log('🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError.message);
    } else {
      console.log('✅ Authentication is working');
    }

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('hospitals')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      console.log('\n📋 Please run this SQL in your Supabase SQL editor:');
      console.log('\n-- Enable PostGIS extension');
      console.log('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('\n-- Create hospitals table');
      console.log(`
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  specialty TEXT[] DEFAULT '{"General Medicine"}',
  opening_hours TEXT DEFAULT 'Hours not available',
  rating DECIMAL(3,2) DEFAULT 4.0,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for location queries
CREATE INDEX IF NOT EXISTS hospitals_location_idx ON hospitals USING GIST (location);

-- Create function to automatically update location from lat/lng
CREATE OR REPLACE FUNCTION update_hospital_location() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_GeogFromText('SRID=4326;POINT(' || NEW.longitude || ' ' || NEW.latitude || ')');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update location
CREATE TRIGGER hospitals_location_trigger
  BEFORE INSERT OR UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_hospital_location();

-- Insert sample hospital data with proper coordinates
INSERT INTO hospitals (name, address, phone, specialty, opening_hours, rating, latitude, longitude) VALUES
('City General Hospital', '123 Main St, New York, NY 10001', '+1-212-555-0123', '{"Emergency", "General Medicine", "Cardiology"}', '24/7', 4.2, 40.7505, -73.9934),
('Metro Medical Center', '456 Health Ave, New York, NY 10016', '+1-212-555-0456', '{"Cardiology", "Neurology", "Orthopedics"}', 'Mon-Fri 6AM-10PM, Sat-Sun 8AM-8PM', 4.5, 40.7549, -73.9840),
('Community Health Clinic', '789 Care Blvd, New York, NY 10025', '+1-212-555-0789', '{"Family Medicine", "Pediatrics", "Internal Medicine"}', 'Mon-Sat 7AM-9PM, Sun 9AM-6PM', 4.0, 40.7831, -73.9712),
('Downtown Emergency Hospital', '321 Emergency St, New York, NY 10013', '+1-212-555-0321', '{"Emergency", "Trauma", "Surgery"}', '24/7', 4.4, 40.7193, -74.0059),
('Riverside Medical Center', '654 River Rd, New York, NY 10024', '+1-212-555-0654', '{"Internal Medicine", "Gastroenterology", "Endocrinology"}', 'Mon-Fri 8AM-6PM', 4.1, 40.7879, -73.9760)
ON CONFLICT (id) DO NOTHING;cation);

-- Insert sample hospital data
INSERT INTO hospitals (name, address, phone, specialty, opening_hours, rating, latitude, longitude, location) VALUES
('City General Hospital', '123 Main St, Downtown', '+1-555-0123', '{"Emergency", "General Medicine"}', '24/7', 4.2, 40.7128, -74.0060, ST_GeogFromText('POINT(-74.0060 40.7128)')),
('Metro Medical Center', '456 Health Ave, Midtown', '+1-555-0456', '{"Cardiology", "Neurology"}', 'Mon-Fri 8AM-6PM', 4.5, 40.7589, -73.9851, ST_GeogFromText('POINT(-73.9851 40.7589)')),
('Community Health Clinic', '789 Care Blvd, Uptown', '+1-555-0789', '{"Family Medicine", "Pediatrics"}', 'Mon-Sat 9AM-5PM', 4.0, 40.7831, -73.9712, ST_GeogFromText('POINT(-73.9712 40.7831)'))
ON CONFLICT (id) DO NOTHING;
      `);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Check if we have hospital data
    const { data: hospitals, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*')
      .limit(5);
    
    if (hospitalError) {
      console.warn('⚠️ Could not fetch hospitals:', hospitalError.message);
    } else {
      console.log(`📊 Found ${hospitals?.length || 0} hospitals in database`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Setup check failed:', error.message);
    return false;
  }
}

checkSupabaseSetup().then(success => {
  if (success) {
    console.log('\n🎉 Supabase is ready for your Medical AI Assistant!');
  } else {
    console.log('\n🔧 Please set up your Supabase database first.');
  }
  process.exit(success ? 0 : 1);
});
